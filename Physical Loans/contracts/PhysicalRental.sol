// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error InsufficientMint(address user);
error NothingToWithdraw(address user);
error transferFailed(address user, uint256 amount);
error statusNotAvailable();
error NotRentYourTool(uint256 toolId);
error NotYourTool(uint256 toolId, address user);
error InsufficientPayment();
error statusNotRented();
error statusIncompatibleToSend();
error statusNotReturned();
error NotOverdue();
error toolNotEditable(uint256 toolId);
error AccessNotPermited(address usurper);
error toolNotSended();
error UnexpectedRequestID(bytes32 requestId);
error errorResponse(bytes lastError);
        
contract PhysicalRental is FunctionsClient, AutomationCompatibleInterface, ERC721URIStorage, Ownable, ReentrancyGuard {
    using FunctionsRequest for FunctionsRequest.Request;
    using PriceConverter for uint256;
    AggregatorV3Interface private immutable i_priceFeed;

    enum toolstatus { Available, Requested, Sended, Rented, Returned, Inspected }
    struct Tool {
        uint256 id;
        address payable owner;
        uint256 rentalPriceUSET;
        uint256 depositUsEt;
        toolstatus status;
        address renter;
        uint256 rentalDuration;
        uint8 condition;
        bool sendedWorked;
        bool sended;
    }
    struct ActiveRental {
        uint256 toolId;
        address renter;
        uint256 rentalEnd;
    }
    struct RequestData {
        bytes32 requestId;
        bytes lError;
        uint256 toolId;
        bool actualWorked;
    }

    uint256 private s_rentalNearLine;
    uint256 private immutable i_minMint;
    uint256 private s_toolCounter;
    mapping(uint256 => Tool) private s_tools;
    mapping(address => uint256) private s_balances;
    mapping(uint256 => ActiveRental) private s_activeRentals;
    using EnumerableSet for EnumerableSet.UintSet;
    EnumerableSet.UintSet private s_activeRentalIds;

    address private immutable i_routerCL;
    bytes32 private immutable i_donId;
    uint32 private immutable i_gasLimit;
    uint64 private immutable i_subscriptionId;
    string private s_source;
    RequestData public s_lastRequest;

    event ToolListed(uint256 indexed id, address indexed owner, uint256 rentalPriceUSET, uint256 depositUsEt, uint8 condition, toolstatus indexed status);
    event RelistToolAvailable(uint256 indexed id, address indexed owner, uint256 rentalPriceUSET, uint256 depositUsEt, uint8 condition, toolstatus indexed status);
    event ToolRequested(uint256 indexed id, address indexed renter, uint256 rentalDuration, uint256 rentalPriceUSET, uint256 depositUsEt, toolstatus indexed status);
    event ToolSended(uint256 indexed id, toolstatus indexed status);
    event ToolRented(uint256 indexed id, address indexed renter, uint256 duration, uint256 rentalPriceUSET, uint256 depositUsEt, toolstatus indexed status);
    event ToolReturned(uint256 indexed id, toolstatus indexed status);
    event ToolInspected(uint256 indexed id, toolstatus indexed status);

    event ToolPenalized(uint256 id, address renter);
    event ToolDamaged(uint256 id);
    event reportUser(address indexed twister, uint256 id, bool toolWorked);
    event ToolDamageTransport(uint256 id);
    event errorResponseRecv(bytes32 indexed requestId, bytes lastError);

    constructor(address priceFeed, uint256 minMint, address router, bytes32 donId, uint32 gasLimit, uint64 subscriptionId, string memory source) 
    ERC721("PhysicalRental", "PHYRL") 
    Ownable(msg.sender) 
    FunctionsClient(router){
        s_toolCounter = 0;
        i_priceFeed = AggregatorV3Interface(priceFeed);
        i_minMint = minMint;
        s_rentalNearLine = 0;
        i_routerCL = router;
        i_donId = donId;
        i_gasLimit = gasLimit;
        i_subscriptionId = subscriptionId;
        s_source = source;
    }

    // ===================== OWNER ACTIONS ======================

    function listTool(string memory tokenURI, uint256 rentalPriceUSday, uint256 depositUsd, uint8 condition) external payable nonReentrant{
        if(msg.value.getConversionRate(i_priceFeed) < i_minMint) {
            revert InsufficientMint(msg.sender);
        }
        
        uint256 toolId = s_toolCounter++;

        _safeMint(msg.sender, toolId);
        _setTokenURI(toolId, tokenURI);

        s_tools[toolId] = Tool({
            id: toolId,
            owner: payable(msg.sender),
            rentalPriceUSET: rentalPriceUSday,
            depositUsEt: depositUsd,
            status: toolstatus.Available,
            renter: address(0),
            rentalDuration: 0,
            condition: condition,
            sendedWorked: false,
            sended: false
        });

        emit ToolListed(toolId, msg.sender, rentalPriceUSday, depositUsd, condition, toolstatus.Available);
    }

    // SOLICITAR AL OWNER TOOL QUE ACTUALICE EL DEPOSIT YA QUE SE ENCUENTRA EN ETH, E IGUAL CON LA RENTAL PRICE PUES YA ESTA MAS USADO +/-
    function RelistTool(uint256 toolId, uint256 newrentalPriceUSday, uint256 newDepositUsd, uint8 newCondition) external nonReentrant{
        Tool storage tool = s_tools[toolId];
        if(tool.owner != msg.sender) {
            revert NotYourTool(toolId, msg.sender);
        }
        if(tool.status != toolstatus.Inspected && tool.status != toolstatus.Available) {
            revert toolNotEditable(toolId);
        }
        tool.rentalPriceUSET = newrentalPriceUSday;
        tool.depositUsEt = newDepositUsd;
        tool.status = toolstatus.Available; 
        tool.renter = address(0);
        tool.rentalDuration = 0;
        tool.condition = newCondition;
        tool.sendedWorked = false; // ?
        tool.sended = false; 
        emit RelistToolAvailable(toolId, msg.sender, newrentalPriceUSday, newDepositUsd, newCondition, toolstatus.Available);
    }


    function withdrawEarnings() external nonReentrant{
        uint256 amount = s_balances[msg.sender];
        if(amount <= 0){
            revert NothingToWithdraw(msg.sender);
        }
        s_balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if(!success) {
            revert transferFailed(msg.sender, amount);
        }
    }

    // ===================== RENTER ACTIONS ======================

    function rentTool(uint256 toolId, uint256 rentalDurationSeconds) external payable nonReentrant{
        Tool storage tool = s_tools[toolId];
        if(tool.status != toolstatus.Available) {
            revert statusNotAvailable();
        }
        if(tool.owner == msg.sender){
            revert NotRentYourTool(toolId);
        }

        uint256 rentalPrice = tool.rentalPriceUSET * (rentalDurationSeconds / 1 days);
        uint256 deposit = tool.depositUsEt;
        uint256 total = rentalPrice + deposit;
        if(msg.value.getConversionRate(i_priceFeed) < total){
            revert InsufficientPayment();
        }

        tool.status = toolstatus.Requested;
        tool.renter = msg.sender;
        tool.rentalDuration = rentalDurationSeconds;
        tool.depositUsEt = (msg.value * deposit) / total;
        tool.rentalPriceUSET = (msg.value * rentalPrice) / total;

        emit ToolRequested(toolId, msg.sender, rentalDurationSeconds, tool.rentalPriceUSET, tool.depositUsEt, toolstatus.Requested);
    }

    // ===================== TOOLS MOVEMENTS =========================
    function sendTool(uint256 toolId, bool actualWorked) external nonReentrant{
        Tool storage tool = s_tools[toolId];
        if(tool.renter != msg.sender && tool.owner != msg.sender) {
            revert AccessNotPermited(msg.sender);
        }
        if(tool.status != toolstatus.Rented && tool.status != toolstatus.Requested) {
            revert statusIncompatibleToSend();
        }
        if(msg.sender == tool.renter){
            tool.status = toolstatus.Returned;
            emit ToolReturned(toolId, toolstatus.Returned);
        }else{
            tool.status = toolstatus.Sended;
            emit ToolSended(toolId, toolstatus.Sended);
        }

        tool.sendedWorked = actualWorked;
        tool.sended = true;
    }

    event DebugToolCheck(address sender, address owner, address renter, uint8 status);
    event DebugArgs(string arg0, string arg1, string arg2);
    event DebugRequestId(bytes32 requestId);
    event DebugBeforeSendRequest();
    event DebugAfterSendRequest(bytes32 requestId);
    event DebugError(string reason);

    function receiveTool(uint256 toolId, bool actualWorked) external nonReentrant returns (bytes32 requestId){

        Tool memory tool = s_tools[toolId];

        emit DebugToolCheck(msg.sender, tool.owner, tool.renter, uint8(tool.status));

        if (tool.owner != msg.sender && tool.renter != msg.sender) {
            revert AccessNotPermited(msg.sender);
        }

        if (tool.status != toolstatus.Sended && tool.status != toolstatus.Returned) {
            revert toolNotSended();
        }

        // ✅ Verifica configuración de Chainlink
        require(i_subscriptionId != 0, "Missing subscription ID");
        require(i_donId != bytes32(0), "DON ID not set");
        require(i_gasLimit > 0, "Gas limit must be greater than 0");

        emit DebugBeforeSendRequest();

        // ********** VERIFICAR CON FUNCTIONS ************************
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source);

        string[] memory args = new string[](3);
        args[0] = Strings.toString(toolId);
        args[1] = actualWorked ? "1" : "0";
        args[2] = tool.sendedWorked ? "1" : "0";
        
        emit DebugArgs(args[0], args[1], args[2]);
        req.setArgs(args);

        // Send the request and store the request ID
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            i_subscriptionId,
            i_gasLimit,
            i_donId
        );

        emit DebugAfterSendRequest(requestId);

        s_lastRequest.requestId = requestId;
        s_lastRequest.toolId = toolId;
        s_lastRequest.actualWorked = actualWorked;

        return requestId;
        /*
        Tool memory tool = s_tools[toolId];
        if(tool.owner != msg.sender && tool.renter != msg.sender){
            revert AccessNotPermited(msg.sender);
        }
        if(tool.status != toolstatus.Sended && tool.status != toolstatus.Returned){
            revert toolNotSended();
        }

        // ********** VERIFICAR CON FUNCTIONS ************************
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(s_source); // Initialize the request with JS code

        string[] memory args = new string[](3);
        args[0] = Strings.toString(toolId);
        args[1] = actualWorked ? "1": "0";
        args[2] = tool.sendedWorked ? "1" : "0";
        req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        bytes32 arequestId = _sendRequest(
            req.encodeCBOR(),
            i_subscriptionId,
            i_gasLimit,
            i_donId
        );

        s_lastRequest.requestId = arequestId;
        s_lastRequest.toolId = toolId;
        s_lastRequest.actualWorked = actualWorked;

        return s_lastRequest.requestId;*/
        
    }

    // Receive the weather in the city requested
    function fulfillRequest( bytes32 requestId, bytes memory response, bytes memory err) internal override {
        RequestData memory req = s_lastRequest;
        if (req.requestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        if(err.length > 0){
            s_lastRequest.lError = err;
            emit errorResponseRecv(requestId, err);
            revert errorResponse(err);
        }
        Tool storage tool = s_tools[req.toolId];
        bool work = req.actualWorked;
        
        //uint8 value = uint8(response[0]) - 48; // Convierte ASCII "0"-"3" en 0-3
        //abi.decode(response, (uint256));
        uint256 value = abi.decode(response, (uint256));

        if(tool.status == toolstatus.Returned){
            if(value == 3){
                emit reportUser(tool.owner, tool.id, work);
            }else if(value == 2){
                emit reportUser(tool.renter, tool.id, tool.sendedWorked);
            }else{
                uint256 deposit = tool.depositUsEt;
                tool.depositUsEt = 0; // Reset deposit
                if(value == 1){
                    address renter = tool.renter;
                    tool.renter = address(0); 
                    (bool success, ) = payable(renter).call{value: deposit}("");
                    if(!success) {
                        revert transferFailed(renter, deposit);
                    }
                }else{
                    s_balances[tool.owner] += deposit;
                    emit ToolDamaged(tool.id);
                    //tool.status = toolstatus.Sended;
                }
                removeActiveRental(tool.id); 
                tool.status = toolstatus.Inspected; // 
                emit ToolInspected(tool.id, toolstatus.Inspected);
                
            }
            
        
        }else if(tool.status == toolstatus.Sended){
            if(value == 3){
                emit reportUser(tool.renter, tool.id, work);
            }else if(value == 2){
                emit reportUser(tool.owner, tool.id, tool.sendedWorked);
            }else{
                if(value == 1){
                    uint256 endTime = block.timestamp + tool.rentalDuration;
                    if(s_rentalNearLine == 0 || endTime < s_rentalNearLine){
                        s_rentalNearLine = endTime;
                    }
                    tool.status = toolstatus.Rented;
                    s_activeRentals[tool.id] = ActiveRental({
                        toolId: tool.id,
                        renter: tool.renter,
                        rentalEnd: endTime
                    });
                    s_activeRentalIds.add(tool.id);
                    s_balances[tool.owner] += tool.rentalPriceUSET; // Owner gets rental price
                    emit ToolRented(tool.id, tool.renter, tool.rentalDuration, tool.rentalPriceUSET, tool.depositUsEt, toolstatus.Rented);
                }else{
                    // Possible damage durin transportation. Who paid transport fit with Insurance or Transport Company
                    emit ToolDamageTransport(tool.id);
                    //tool.status = toolstatus.Returned;
                }
            }
    
        }
    }

    // ===================== AUTOMATION/PENALTY ======================

    function checkUpkeep( bytes calldata /* checkData */) external view override returns (bool, bytes memory)  {
        if (block.timestamp <= s_rentalNearLine) {
            return (false, bytes(""));
        }
        uint256 count = 0;
        uint256 newDeadLine = type(uint256).max;
        uint256 setLength = s_activeRentalIds.length();
        uint256[] memory lateToolIds = new uint256[](setLength);

        for (uint256 i = 0; i < setLength; i++) {
            uint256 toolId = s_activeRentalIds.at(i);
            ActiveRental memory rental = s_activeRentals[toolId];

            if (rental.rentalEnd < block.timestamp) {
                lateToolIds[count] = toolId;
                count++;
            } else if (rental.rentalEnd < newDeadLine) {
                newDeadLine = rental.rentalEnd;
            }
        }

        if (count > 0) {
            uint256[] memory lateIds = new uint256[](count);
            for (uint256 j = 0; j < count; j++) {
                lateIds[j] = lateToolIds[j];
            }

            return (true, abi.encode(lateIds, newDeadLine));
        }

        return (false, bytes(""));

    }
    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory lateToolIds, uint256 updatedDeadLine) = abi.decode(performData, (uint256[], uint256));

        for (uint256 i = 0; i < lateToolIds.length; i++) {
            uint256 toolId = lateToolIds[i];
            ActiveRental storage rental = s_activeRentals[toolId];
            Tool storage tool = s_tools[toolId];

            if(tool.status != toolstatus.Rented){
                revert statusNotRented();
            }
            if(block.timestamp <= rental.rentalEnd) {
                revert NotOverdue();
            }
            // Penalize: deposit goes to owner
            s_balances[tool.owner] += (tool.depositUsEt * 20) / 100; 
            tool.depositUsEt = (tool.depositUsEt * 80) / 100; 

            if(tool.depositUsEt > 0){
                rental.rentalEnd = block.timestamp + 1 days; 
                tool.rentalDuration += 1 days;

                if(rental.rentalEnd < updatedDeadLine) {
                    s_rentalNearLine = rental.rentalEnd;
                } else {
                    s_rentalNearLine = updatedDeadLine;
                }
            }else{
                removeActiveRental(toolId);
                s_rentalNearLine = updatedDeadLine;
                //********************************************************************** reportar renter*/
            }
            
            emit ToolPenalized(toolId, tool.renter);
        }
    }
    function removeActiveRental(uint256 toolId) internal {
        delete s_activeRentals[toolId];
        s_activeRentalIds.remove(toolId);
    }

    // ===================== GETTERS ======================
    function getTool(uint256 toolId) external view returns (Tool memory) {
        return s_tools[toolId];
    }
    function getActiveRental(uint256 toolId) external view returns (ActiveRental memory) {
        return s_activeRentals[toolId];
    }
    function getRentalNearLine() external view returns (uint256) {
        return s_rentalNearLine;
    }
    function getBalance(address user) external view returns (uint256) {
        return s_balances[user];
    }
    function getMinMint() external view returns (uint256) {
        return i_minMint;
    }

}

