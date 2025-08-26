import { gql } from "@apollo/client";

const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(first: 5) {
      id
      toolId
      owner
      rentalPriceUSET
      depositUsEt
      renter
      rentalDuration
      status
      condition
    }
  }
`;
export default GET_ACTIVE_ITEMS;
