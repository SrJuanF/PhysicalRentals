# 🛠️ Physical Tool Loan dApp

This decentralized application (dApp) enables users to **lend or rent physical tools** in a secure and trustless environment using blockchain, automated services, and off-chain validation.

## 🔧 Technologies Used

- [Hardhat](https://hardhat.org/) – Smart contract development environment  
- [Solidity](https://docs.soliditylang.org/) – Smart contract language  
- [OpenZeppelin](https://openzeppelin.com/contracts/) – Security-focused contract library  
- [Chainlink](https://chain.link/) – Automation & off-chain data integration  
- [Next.js](https://nextjs.org/) – Frontend framework  
- [Moralis](https://moralis.io/) – Web3 wallet integration & authentication  
- [The Graph](https://thegraph.com/) – Blockchain data indexing  
- [Supabase](https://supabase.io/) – Realtime database & backend  

---

## 🔄 How It Works

### 1. Tool Lending or Rental
Users can choose to **lend** or **rent** a physical tool. When a rental is requested, the tool owner must approve the condition of the tool before shipping.

### 2. Condition Validation Before Shipping
- A **simulated AI system** verifies the tool is in good condition.
- This information is saved in **Supabase**.
- The tool is sent to the renter.

### 3. Condition Validation Upon Arrival
- When the renter receives the tool, another **simulated AI analysis** checks the tool’s current condition.
- If validated as good, the **rental payment** is released and a **security deposit** is locked.

### 4. Automated Deadline Tracking
- **Chainlink Automation** monitors all active loans.
- A `checkUpkeep` function identifies overdue rentals by comparing the **closest expiration date** with the current timestamp to minimize gas usage.

### 5. End of Rental – Return or Penalty
- If the tool is returned, the system performs a final **real-time condition analysis**.
- Data is updated in Supabase.
- If the tool is damaged, the **deposit is used to compensate** the lender.

### 6. Fraud Prevention & Discrepancy Detection
- When the tool is received (by owner or renter), a **Chainlink Function** is triggered.
- This function accesses Supabase and verifies the user's declared condition against the system-stored condition.
- Discrepancies are flagged and the responsible party is reported for **fraudulent tool condition reporting**.

---

## 🔐 Trust & Safety Mechanisms

- **Bad-condition tools cannot be shipped** by owners; the system blocks such actions using AI-based checks.
- **Security deposits** cover potential damage caused by renters.
- All condition reports are **cross-validated** using off-chain storage and automated Chainlink Functions.
- Ensures **transparency, accountability**, and **safe peer-to-peer tool rentals**.

---

## 📂 Project Status

This is a work-in-progress prototype combining smart contract interactions with off-chain AI-simulated validations. Future versions may include:

- Real AI/ML-based image or video condition validation  
- Arbitration system for unresolved disputes  
- Mobile version of the dApp  

---

## 🧠 Author

Built by Juan Felipe Gaviria Giraldo  
Feel free to contribute, fork, or reach out for collaborations!

