// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/v0.8/dev/vrf/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/v0.8/dev/vrf/libraries/VRFV2PlusClient.sol";

import "./Counter.sol";

// contract Lottery is Ownable, VRFConsumerBaseV2Plus {
contract Lottery is VRFConsumerBaseV2Plus, ReentrancyGuard {
    using Counter for Counter.CounterData;

    struct LotteryStruct {
        uint256 id;
        string title;
        string description;
        string image;
        // uint256 prize;
        uint256 ticketPrice;
        uint256 participants;
        uint256 winners;
        bool drawn;
        address owner;
        uint256 createdAt;
        uint256 expiresAt;
        bool hasLuckyNumbers;
    }

    struct ParticipantStruct {
        address account;
        string lotteryNumber;
        bool paid;
    }

    struct LotteryResultStruct {
        uint256 id;
        // for chaninlink vrf
        uint256 requestId;
        bool completed;
        bool paidout;
        uint256 timestamp;
        uint256 sharePerWinner;
        ParticipantStruct[] winners;
        // bool fulfilled;
        bool exists;
        uint256[] randomNumber;
        bool requestToChainlinkSent;
    }

    struct RequestIdToLotteryId {
        uint256 lotteryId;
        uint256 requestId;
    }

    mapping(uint256 => LotteryStruct) lotteries;
    mapping(uint256 => ParticipantStruct[]) lotteryParticipants;
    mapping(uint256 => string[]) lotteryLuckyNumbers;
    mapping(uint256 => mapping(uint256 => bool)) luckyNumberUsed;
    mapping(uint256 => LotteryResultStruct) lotteryResult;
    mapping(uint256 => RequestIdToLotteryId) requestIdToLotteryId;

    Counter.CounterData private _totalLotteries;
    uint256 public servicePercent;
    uint256 public serviceBalance;

    // Your subscription ID.
    uint256 public s_subscriptionId;
    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2-5/supported-networks
    bytes32 public keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 public callbackGasLimit = 1000000;

    // The default is 3, but you can set this higher.
    uint16 public requestConfirmations = 3;
    uint32 numWords = 1;
    uint256 public lastRequestId;

    event LotteryCreated(
        uint256 id,
        string title,
        string description,
        string image,
        // uint256 prize,
        uint256 ticketPrice,
        uint256 expiresAt
    );

    event LotteryLuckyNumbersImported(uint256 id, string[] luckyNumbers);

    event BuyTicketEvent(uint256 id, address account, string lotteryNumber);

    event LotteryWinnerRequestSent(
        uint256 lotteryId,
        uint256 String,
        uint32 numOfWinners
    );

    event LotteryWinnerSelected(
        uint256 lotteryId,
        uint256 String,
        uint256[] randomWords
    );

    event LotteryWinnerPaid(
        uint256 lotteryId,
        uint256 amount,
        uint256 platformShare
    );

    constructor(
        // address initialOwner,
        uint256 _servicePercent,
        uint256 _subscriptionId
    )
        // Ownable(initialOwner)
        VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B)
    {
        servicePercent = _servicePercent;
        s_subscriptionId = _subscriptionId;
    }

    function createLottery(
        string memory title,
        string memory description,
        string memory image,
        // uint256 prize,
        uint256 ticketPrice,
        uint256 expiresAt
    ) public {
        require(bytes(title).length > 0, "title cannot be empty");
        require(bytes(description).length > 0, "description cannot be empty");
        require(bytes(image).length > 0, "image cannot be empty");
        // require(prize > 0 ether, "prize cannot be zero");
        require(ticketPrice > 0 ether, "ticketPrice cannot be zero");
        require(
            expiresAt > currentTime(),
            "expireAt cannot be less than the future"
        );

        _totalLotteries.increment();
        LotteryStruct memory lottery;

        lottery.id = _totalLotteries.current();
        lottery.title = title;
        lottery.description = description;
        lottery.image = image;
        // lottery.prize = prize;
        lottery.ticketPrice = ticketPrice;
        lottery.owner = msg.sender;
        lottery.createdAt = currentTime();
        lottery.expiresAt = expiresAt;

        lotteries[lottery.id] = lottery;

        emit LotteryCreated(
            lottery.id,
            lottery.title,
            lottery.description,
            lottery.image,
            // lottery.prize,
            lottery.ticketPrice,
            lottery.expiresAt
        );
    }

    function importLuckyNumbers(
        uint256 id,
        string[] memory luckyNumbers
    ) public {
        require(luckyNumbers.length > 0, "Lucky numbers cannot be zero");
        require(lotteries[id].owner == msg.sender, "Unauthorized entity");
        require(lotteryLuckyNumbers[id].length < 1, "Already generated");
        lotteryLuckyNumbers[id] = luckyNumbers;
        lotteries[id].hasLuckyNumbers = true;

        emit LotteryLuckyNumbersImported(id, luckyNumbers);
    }

    function buyTicket(
        uint256 id,
        uint256 luckyNumberId
    ) public payable nonReentrant {
        require(
            !luckyNumberUsed[id][luckyNumberId],
            "Lucky number already used"
        );
        require(
            msg.value >= lotteries[id].ticketPrice,
            "insufficient ethers to buy ticket"
        );
        require(lotteries[id].drawn == false);

        lotteries[id].participants++;
        lotteryParticipants[id].push(
            ParticipantStruct(
                msg.sender,
                lotteryLuckyNumbers[id][luckyNumberId],
                false
            )
        );

        luckyNumberUsed[id][luckyNumberId] = true;
        serviceBalance += msg.value;

        emit BuyTicketEvent(
            id,
            msg.sender,
            lotteryLuckyNumbers[id][luckyNumberId]
        );
    }

    // ! For testing purposes
    //      function randomlySelectWinners(uint256 id, uint256 numOfWinners) public {
    //     require(lotteries[id].owner == msg.sender || msg.sender == owner(), 'Unauthorized entity');
    //     require(!lotteryResult[id].completed, 'Lottery have already been completed');
    //     require(
    //       numOfWinners <= lotteryParticipants[id].length,
    //       'Number of winners exceeds number of participants'
    //     );

    //     // Initialize an array to store the selected winners
    //     ParticipantStruct[] memory winners = new ParticipantStruct[](numOfWinners);
    //     ParticipantStruct[] memory participants = lotteryParticipants[id];

    //     // Initialize the list of indices with the values 0, 1, ..., n-1
    //     uint256[] memory indices = new uint256[](participants.length);
    //     for (uint256 i = 0; i < participants.length; i++) {
    //       indices[i] = i;
    //     }

    //     // Shuffle the list of indices using Fisher-Yates algorithm
    //     for (uint256 i = participants.length - 1; i >= 1; i--) {
    //       uint256 j = uint256(keccak256(abi.encodePacked(currentTime(), i))) % (i + 1);
    //       uint256 temp = indices[j];
    //       indices[j] = indices[i];
    //       indices[i] = temp;
    //     }

    //     // Select the winners using the first numOfWinners indices
    //     for (uint256 i = 0; i < numOfWinners; i++) {
    //       winners[i] = participants[indices[i]];
    //       lotteryResult[id].winners.push(winners[i]);
    //     }

    //     lotteryResult[id].completed = true;
    //     lotteryResult[id].timestamp = currentTime();
    //     lotteries[id].winners = lotteryResult[id].winners.length;
    //     lotteries[id].drawn = true;

    //     payLotteryWinners(id);
    //   }

    // Assumes the subscription is funded sufficiently.
    // @param enableNativePayment: Set to `true` to enable payment in native tokens, or
    // `false` to pay in LINK
    function randomlySelectWinners(
        uint256 id,
        uint256 numOfWinners
    ) public nonReentrant returns (uint256 requestId) {
        require(
            lotteries[id].owner == msg.sender || msg.sender == owner(),
            "Unauthorized entity"
        );
        require(
            !lotteryResult[id].completed,
            "Lottery have already been completed"
        );
        require(
            numOfWinners <= lotteryParticipants[id].length,
            "Number of winners exceeds number of participants"
        );
        require(
            !lotteryResult[id].requestToChainlinkSent,
            "Request to chainlink already sent"
        );
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                // numWords: numWords,
                numWords: uint32(numOfWinners),
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Initialize the struct without the dynamic arrays.
        lotteryResult[id].id = id;
        lotteryResult[id].completed = false;
        lotteryResult[id].paidout = false;
        // lotteryResult[id].timestamp = currentTime();
        lotteryResult[id].sharePerWinner = 0;
        lotteryResult[id].exists = true;
        lotteryResult[id].requestId = requestId;
        lotteryResult[id].requestToChainlinkSent = true;

        requestIdToLotteryId[requestId] = RequestIdToLotteryId({
            lotteryId: id,
            requestId: requestId
        });

        emit LotteryWinnerRequestSent(id, requestId, uint32(numOfWinners)); // Corrected emit statement
        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId, // The requestId that was returned from requestRandomWords
        uint256[] memory randomWords // An array of random numbers from the VRF
    ) internal override {
        require(
            requestIdToLotteryId[requestId].requestId == requestId,
            "Error: Request not found"
        );
        // uint256 lotteryId = lotteryResult[requestId].id;
        uint256 lotteryId = requestIdToLotteryId[requestId].lotteryId;
        uint256[] memory indices = new uint256[](randomWords.length);

        // Assign random indices based on the random word provided
        for (uint256 i = 0; i < randomWords.length; i++) {
            // This random index will map to a participant in the lotteryParticipants array
            indices[i] = randomWords[i] % lotteryParticipants[lotteryId].length;
            lotteryResult[lotteryId].winners.push(
                lotteryParticipants[lotteryId][indices[i]]
            );
        }

        // Now that winners are selected, set the lottery as completed
        lotteryResult[lotteryId].completed = true;
        lotteryResult[lotteryId].timestamp = block.timestamp;
        lotteries[lotteryId].winners = lotteryResult[lotteryId].winners.length;
        lotteries[lotteryId].drawn = true;
        lotteryResult[lotteryId].randomNumber = randomWords; // Store the random number (if needed for audit)

        // Call the function to pay winners
        payLotteryWinners(lotteryId);
        emit LotteryWinnerSelected(lotteryId, requestId, randomWords);
    }

    function payLotteryWinners(uint256 id) internal {
        ParticipantStruct[] memory winners = lotteryResult[id].winners;
        uint256 totalShares = lotteries[id].ticketPrice *
            lotteryParticipants[id].length;
        uint256 platformShare = (totalShares * servicePercent) / 100;
        uint256 netShare = totalShares - platformShare;
        uint256 sharesPerWinner = netShare / winners.length;

        for (uint256 i = 0; i < winners.length; i++) {
            payTo(winners[i].account, sharesPerWinner);
            // winners[i].paid = true;
            lotteryResult[id].winners[i].paid = true;
        }

        payTo(owner(), platformShare);
        serviceBalance -= totalShares;
        lotteryResult[id].id = id;
        lotteryResult[id].paidout = true;
        lotteryResult[id].sharePerWinner = sharesPerWinner;

        emit LotteryWinnerPaid(id, sharesPerWinner, platformShare);
    }

    function getLotteries()
        public
        view
        returns (LotteryStruct[] memory Lotteries)
    {
        Lotteries = new LotteryStruct[](_totalLotteries.current());

        for (uint256 i = 1; i <= _totalLotteries.current(); i++) {
            Lotteries[i - 1] = lotteries[i];
        }
    }

    function getMyLotteries() public view returns (LotteryStruct[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _totalLotteries.current(); i++) {
            if (lotteries[i].owner == msg.sender) {
                count++;
            }
        }

        LotteryStruct[] memory myLotteries = new LotteryStruct[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= _totalLotteries.current(); i++) {
            if (lotteries[i].owner == msg.sender) {
                myLotteries[index] = lotteries[i];
                index++;
            }
        }

        return myLotteries;
    }

    function getLottery(uint id) public view returns (LotteryStruct memory) {
        return lotteries[id];
    }

    function getLotteryParticipants(
        uint id
    ) public view returns (ParticipantStruct[] memory) {
        return lotteryParticipants[id];
    }

    function getLotteryLuckyNumbers(
        uint256 id
    ) public view returns (string[] memory) {
        return lotteryLuckyNumbers[id];
    }

    function getLotteryResult(
        uint256 id
    ) public view returns (LotteryResultStruct memory) {
        return lotteryResult[id];
    }

    function payTo(address to, uint256 amount) internal nonReentrant {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }

    function currentTime() internal view returns (uint256) {
        uint256 newNum = (block.timestamp * 1000) + 1000;
        return newNum;
    }
}
