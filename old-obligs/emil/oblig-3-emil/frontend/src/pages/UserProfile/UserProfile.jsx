import styles from './UserProfile.module.css';
import { useAuth } from '../../hooks/useAuth.js';
import { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile.js';
// import { useNavigate } from useNavigate;
/*
    Hva skal denne siden gjøre?
        Skal vise og endre på: 
        profil bilde
        brukernavn (det skal ikke kunne endres)
        epost
        about me description
        passord (skal kunne nedres, men ikke vises på profil siden, kanskje en knapp der det stpr endre passord også blir man tatt med vidre til noe.....)

    Vi skal vise på siden:
        user stats: 
            Elo rating, n of played games, n of losses, n of wins i den siste month
            List of users last 10 games
            link to another page to view all users games

*/



export default function UserProfile(){
    const  { username, email, password, isLoading, error } = useUserProfile();
    console.log(username)

    const [ isEditing, setIsEditing ] = useState(false);
    const [ updateProfile, setUpdateProfile ] = useState(null);

    
    const { user } = useAuth(); // Our user information. 
    console.log(user);
    function handleSubmit(e){
        e.preventDefault();
        setIsEditing(!isEditing);
    }

    function handleUsernameChange(e){
        setUpdateProfile(e.target.value);
    }

    return(
        <form onSubmit={handleSubmit}>
            <label>

            </label>
        </form>
    );
}