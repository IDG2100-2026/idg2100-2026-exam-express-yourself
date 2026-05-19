import { getGame } from "../services/individualGame";
import { useState, useEffect } from "react";

export function useGame(gameId){
    const [ game, setGame ] = useState([]);
    const [ error, setError ] = useState(null);
    const [ isLoading, setIsLoading ] = useState(false);

    
    
    useEffect(() => {
        let isMounted = true;
        async function fetchGame(){
            try{
                const gameData = await getGame(gameId);
                if(isMounted){
                    setGame(gameData);
                }
            }catch(err){
                if(isMounted){
                    setError(err.message);
                }
            }finally{
                if(isMounted){
                    setIsLoading(false);
                }
            }
        }

        fetchGame();
        const refreshEvery15Sec = setInterval(fetchGame, 15000) // TODO: Change back to 15 sec

        // Clean-up
        return () => {
            isMounted = false;
            clearInterval(refreshEvery15Sec)
        }
    }, [gameId]);

    return { game, error, isLoading }
}
