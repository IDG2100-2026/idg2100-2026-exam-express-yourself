import Trophy from "../models/Trophy.js";

export async function createTrophy(trophyData) { //add new trophy to the db
    const newTrophy = new Trophy(trophyData);
    return newTrophy.save();
}

export async function getTrophy(id) { //find one trophy by id
    const trophy = await Trophy.findById(id);
    if (!trophy) {
        throw new Error("NOT_FOUND");
    }
    return trophy;
}