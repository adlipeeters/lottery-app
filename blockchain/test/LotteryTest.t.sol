// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol"; // Import console
import "../src/Lottery.sol";
import "../src/Counter.sol";
import "@chainlink/contracts/v0.8/mocks/VRFCoordinatorV2Mock.sol";

contract LotteryTest is Test {
    Lottery public lottery;
    VRFCoordinatorV2Mock public vrfCoordinator;
    uint64 public subId;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    function setUp() public {
        vrfCoordinator = new VRFCoordinatorV2Mock(0, 0); // Arguments are irrelevant in the mock
        subId = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(subId, 1 ether);

        // Initialize the Lottery contract
        lottery = new Lottery(5, subId); // 5% service fee
        lottery.transferOwnership(owner);
    }

    function testCreateLottery() public {
        vm.prank(owner);
        console.log("Creating lottery...");
        lottery.createLottery(
            "Lottery 1",
            "Description 1",
            "image1.png",
            1 ether,
            0.1 ether,
            block.timestamp + 1 days
        );

        Lottery.LotteryStruct[] memory lotteries = lottery.getLotteries();
        // Logging the length of lotteries array
        console.log("Total Lotteries:", lotteries.length);

        // Logging details of the first lottery
        if (lotteries.length > 0) {
            console.log("Lottery ID:", lotteries[0].id);
            console.log("Title:", lotteries[0].title);
            console.log("Description:", lotteries[0].description);
            console.log("Image:", lotteries[0].image);
            console.log("Prize:", lotteries[0].prize);
            console.log("Ticket Price:", lotteries[0].ticketPrice);
            console.log("Owner:", lotteries[0].owner);
            console.log("Created At:", lotteries[0].createdAt);
            console.log("Expires At:", lotteries[0].expiresAt);
        }

        assertEq(lotteries.length, 1);
        assertEq(lotteries[0].title, "Lottery 1");
        assertEq(lotteries[0].prize, 1 ether);
    }

    function testBuyTicket() public {
        vm.prank(owner);
        lottery.createLottery(
            "Lottery 1",
            "Description 1",
            "image1.png",
            1 ether,
            0.1 ether,
            block.timestamp + 1 days
        );

        vm.prank(owner);
        // Define a fixed-size array
        string[3] memory luckyNumbersFixed = ["123", "456", "789"];
        // Convert to a dynamic array
        string[] memory luckyNumbers = new string[](luckyNumbersFixed.length);
        for (uint i = 0; i < luckyNumbersFixed.length; i++) {
            luckyNumbers[i] = luckyNumbersFixed[i];
        }
        lottery.importLuckyNumbers(1, luckyNumbers);

        vm.prank(user1);
        vm.deal(user1, 1 ether); // Fund user1 with 1 ether
        lottery.buyTicket{value: 0.1 ether}(1, 0);

        Lottery.ParticipantStruct[] memory participants = lottery
            .getLotteryParticipants(1);
        assertEq(participants.length, 1);
        assertEq(participants[0].account, user1);
        assertEq(participants[0].lotteryNumber, "123");
    }

    function testRandomlySelectWinners() public {
        vm.prank(owner);
        lottery.createLottery(
            "Lottery Test",
            "Test Description",
            "testImage.png",
            5 ether,
            0.1 ether,
            block.timestamp + 1 days
        );

        // Importing some lucky numbers for the lottery
        string[] memory luckyNumbers = new string[](5);
        luckyNumbers[0] = "001";
        luckyNumbers[1] = "002";
        luckyNumbers[2] = "003";
        luckyNumbers[3] = "004";
        luckyNumbers[4] = "005";
        vm.prank(owner);
        lottery.importLuckyNumbers(1, luckyNumbers);

        // Participants buy tickets
        uint participantsCount = 5;
        for (uint i = 0; i < participantsCount; i++) {
            address participant = address(
                uint160(uint256(uint160(owner)) + i + 1)
            );
            vm.prank(participant);
            vm.deal(participant, 1 ether);
            lottery.buyTicket{value: 0.1 ether}(1, i);
        }

        // Simulate random selection
        vm.prank(owner);
        uint requestId = lottery.randomlySelectWinners(1, 3);
        console.log("Request ID:", requestId);
        // uint[] memory mockRandomWords = new uint[](1);
        // mockRandomWords[0] = uint(keccak256(abi.encodePacked(block.timestamp))); // Pseudo-randomness for demonstration
        // vrfCoordinator.fulfillRandomWords(
        //     requestId,
        //     address(lottery)
        //     // mockRandomWords
        // );

        // // Check results
        // Lottery.LotteryResultStruct memory results = lottery.getLotteryResult(
        //     1
        // );
        // assertEq(results.winners.length, 3, "Should have exactly 3 winners");
    }
}
