# Example Flow: Simple Token Transfer Contract

## Step-by-Step Guide

### Step 1: Create State Variables

1. **Add a "State" node** (Circle - Green)
   - Label: `totalSupply`
   - Data Type: `uint256`
   - Initial Value: `1000000`
   - Visibility: `public`

2. **Add another "State" node**
   - Label: `owner`
   - Data Type: `address`
   - Initial Value: (leave empty, will be set in constructor)
   - Visibility: `public`

3. **Add another "State" node**
   - Label: `balances`
   - Data Type: `mapping(address => uint256)`
   - Initial Value: (leave empty)
   - Visibility: `public`

### Step 2: Create a Modifier

4. **Add a "Modifier" node** (Octagon - Yellow)
   - Label: `onlyOwner`
   - Access Condition: `msg.sender == owner`

### Step 3: Create the Transfer Function

5. **Add a "Function" node** (Hexagon - Green)
   - Label: `transfer`
   - Parameters: `address to, uint256 amount`
   - Visibility: `public`
   - Payable: (unchecked)

6. **Connect the Modifier to the Function**
   - Drag from the bottom port of "onlyOwner" modifier
   - Connect to the left port of "transfer" function

### Step 4: Add Validation Logic

7. **Add a "Condition" node** (Diamond - Yellow)
   - Label: `checkBalance`
   - Condition Expression: `balances[msg.sender] >= amount`

8. **Connect Function to Condition**
   - Drag from the right port of "transfer" function
   - Connect to the left port of "checkBalance" condition

### Step 5: Add Operations

9. **Add an "Operation" node** (Square - Green)
   - Label: `deductBalance`
   - Operation Expression: `balances[msg.sender] -= amount`

10. **Add another "Operation" node**
    - Label: `addBalance`
    - Operation Expression: `balances[to] += amount`

11. **Connect Condition True Path to Operations**
    - Drag from the RIGHT port (T) of "checkBalance" condition
    - Connect to the left port of "deductBalance" operation
    - Drag from the right port of "deductBalance"
    - Connect to the left port of "addBalance" operation

### Step 6: Add an Event

12. **Add an "Event" node** (Triangle - Yellow)
    - Label: `Transfer`
    - Event Parameters: `address indexed from, address indexed to, uint256 amount`

13. **Connect Operation to Event**
    - Drag from the right port of "addBalance" operation
    - Connect to the left port of "Transfer" event

### Step 7: Connect State Variables to Operations

14. **Connect State to Operations**
    - Drag from the RIGHT port of "balances" state node
    - Connect to the LEFT port of "deductBalance" operation
    - Drag from the RIGHT port of "balances" state node  
    - Connect to the LEFT port of "addBalance" operation

## Step 8: Add Error Handling (Optional)

15. **Add another "Operation" node**
    - Label: `revertTransfer`
    - Operation Expression: `revert("Insufficient balance")`

16. **Connect Condition False Path**
    - Drag from the BOTTOM port (F) of "checkBalance" condition
    - Connect to the left port of "revertTransfer" operation

## Final Flow Diagram:

```
[balances State] ──(right)──> [deductBalance Operation] (left)
              └─(right)──> [addBalance Operation] (left)

[onlyOwner Modifier] ──(bottom)──> [transfer Function] (left)
                                        │
                                        └─(right)──> [checkBalance Condition] (left)
                                                          │
                                                          ├─(T/right)──> [deductBalance Operation] (left) ──> [addBalance Operation] (left) ──> [Transfer Event] (left)
                                                          │
                                                          └─(F/bottom)──> [revertTransfer Operation] (left)
```

## How to Connect:

**Simple Rule:** Connect from RIGHT/BOTTOM ports to LEFT ports

- **State** → **Operation**: State right port → Operation left port
- **Modifier** → **Function**: Modifier bottom port → Function left port  
- **Function** → **Condition**: Function right port → Condition left port
- **Condition** → **Operation**: Condition right/bottom port → Operation left port
- **Operation** → **Event**: Operation right port → Event left port

## Expected Generated Code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChainChartContract {
    uint256 public totalSupply = 1000000;
    address public owner;
    mapping(address => uint256) public balances;

    modifier onlyOwner() {
        require(msg.sender == owner, "Access denied");
        _;
    }

    event Transfer(address indexed from, address indexed to, uint256 amount);

    function transfer(address to, uint256 amount) public onlyOwner {
        if (balances[msg.sender] >= amount) {
            balances[msg.sender] -= amount;
            balances[to] += amount;
            emit Transfer(msg.sender, to, amount);
        } else {
            revert("Insufficient balance");
        }
    }
}
```

## Simple Connection Rules:

### Function Nodes (Hexagon):
- **Left port** ← Connect modifiers here
- **Right port** → Connects to conditions/operations

### State Nodes (Circle):
- **Right port** → Connect to operations/conditions to use the variable

### Operation Nodes (Square):
- **Left port** ← Connect from functions/conditions/state/other operations
- **Right port** → Connect to next operation or event

### Condition Nodes (Diamond):
- **Left port** ← Connect function or operation here
- **Right port (T)** → True path - connect operations here
- **Bottom port (F)** → False path - connect error handling here

### Modifier Nodes (Octagon):
- **Bottom port** → Connect to function's left port

### Event Nodes (Triangle):
- **Left port** ← Connect from operations/functions

## Tips:

- **Click nodes** to edit their properties in the Inspector panel
- **Drag connections** from output ports (right/bottom) to input ports (left/top)
- **State nodes** connect FROM their right port TO operations/conditions
- **Functions** can connect to many things - use right port for main flow
- **Watch the code** update in real-time in the Live Preview terminal
- **Save your work** using the Save button in the toolbar

