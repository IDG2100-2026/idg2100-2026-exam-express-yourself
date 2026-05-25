export const rollDice = (currentDice, held) => {
  return currentDice.map((die, i) => {
    if (held[i]) return die; // if the die is held, we return it, meaning it won't be re-rolled
    return Math.floor(Math.random() * 6 + 7); // gives us random numbers between 7 and 12. 7 = 7, 8 = 8, 9 = J, 10 = Q, 11 = K, 12 = A
  });
};

export const evaluateHand = (dice, straightAllowed) => {
  const counts = {}; // Empty object where the dice rolls will end up
  for (const die of dice) {
    counts[die] = (counts[die] || 0) + 1; // Count how many times each die face appears. if first time, it hits || 0 but if found before, it hits counts[die] + 1
  }
  const diceKeys = Object.keys(counts).map(Number); // Grabs the key in the counts object. e.g, { 12: 3, 10: 2 } will be [12, 10]
  const diceValues = Object.values(counts).sort((low, high) => high - low); // grabs the value in the counts object. e.g, { 12: 3, 10: 2 } will be ["3", "2"] since we are sorting in ascending order

  const sortDiceOrder = [...dice].sort((low, high) => low - high); // sorts the array in ascending order. e.g, [7, 7, 8, 10, 11];
  const isStraight =
    straightAllowed &&
    sortDiceOrder[4] - sortDiceOrder[0] === 4 &&
    diceKeys.length === 5; // checks if we have a valid straight, and if we don't have a false straight

  let rank;
  if (diceValues[0] === 5) {
    rank = 8; // five of a kind
  } else if (diceValues[0] === 4) {
    rank = 7; // four of a kind
  } else if (diceValues[0] === 3 && diceValues[1] === 2) {
    rank = 6; // full hoguse
  } else if (isStraight) {
    rank = 5; // straight
  } else if (diceValues[0] === 3) {
    rank = 4; // three of a kind
  } else if (diceValues[0] === 2 && diceValues[1] === 2) {
    rank = 3; // two pairs
  } else if (diceValues[0] === 2) {
    rank = 2; // single pair
  } else {
    rank = 1; // high card
  }

  return { rank, counts };
};

export const compareHands = (firstHand, secondHand) => {
  if (firstHand.rank > secondHand.rank) return 1; // 1 means that firstHand is the winner
  if (firstHand.rank < secondHand.rank) return -1; // -1 means that the secondHand is the winner. 0 will be for ties

  // same rank so we compare dice values
  const firstPriority = getTieBreaker(firstHand);
  const secondPriority = getTieBreaker(secondHand);

  for (let i = 0; i < firstPriority.length; i++) {
    if (firstPriority[i] > secondPriority[i]) return 1; // firstPriority has the winner hand
    if (firstPriority[i] < secondPriority[i]) return -1; // secondPriority has the winner hans
  }

  return 0; // hands are identical
};

export const getTieBreaker = (hand) => {
  const entries = Object.entries(hand.counts).map(([value, count]) => ({
    value: Number(value), // Die face number e.g, 12, 10, 9 etc...
    count, // How many times that die face got rolled!
  })); // will look like [{ value: 12, count: 2 }, {value: 10, count: 2}, { value: 8, count: 1 }]

  // sort entries with most repeated dice first. if they have the same amount of counts, we check for highest face value
  entries.sort((entryA, entryB) => {
    if (entryB.count !== entryA.count) return entryB.count - entryA.count; // different count. highest counts goes first e.g, [3, 1, 1] vs [2, 2, 1] the first wins.
    return entryB.value - entryA.value; // if the counts are identical, check who has the highest value. e.g, [12, 10, 7] vs [12, 9, 7] the  first one wins since after 12, 11 is higher than 9
  });

  return entries.map((entry) => entry.value); // extracts the die face value in order
};

export const findRoundWinner = (players, straightAllowed) => {
  const hands = players.map((player) =>
    evaluateHand(player.dice, straightAllowed),
  ); // getting the players dices, and check if straight is allowed

  let bestPlayer = 0; // assume index 0 player is the best, if a better comes, this will increment to that player index;

  for (let i = 1; i < hands.length; i++) {
    const result = compareHands(hands[i], hands[bestPlayer]); // checks if the now looping player has better dices than current best player
    if (result === 1) {
      bestPlayer = i; // if the compareHands gives 1 (which is the better hand) we set that player to be the best player
    }
  }

  // check if we have multiple winners
  const winners = [bestPlayer];
  for (let i = 0; i < hands.length; i++) {
    if (i === bestPlayer) continue; // skip the already winner
    if (compareHands(hands[i], hands[bestPlayer]) === 0) {
      // if they get a 0 from comparehands function which is tie push that player into winners since they have identical hands as the best player
      winners.push(i);
    };
  };

  return { hands, winners };
};
