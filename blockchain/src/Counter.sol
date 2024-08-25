// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library Counter {
    struct CounterData {
        uint256 value; // default: 0
    }

    function current(
        CounterData storage counter
    ) internal view returns (uint256) {
        return counter.value;
    }

    function increment(CounterData storage counter) internal {
        counter.value += 1;
    }

    function decrement(CounterData storage counter) internal {
        uint256 value = counter.value;
        require(value > 0, "Counter: decrement overflow");
        counter.value = value - 1;
    }

    function reset(CounterData storage counter) internal {
        counter.value = 0;
    }
}
