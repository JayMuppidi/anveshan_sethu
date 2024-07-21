import Header from "../components/Header";
import SignupMentor from "../components/SignupMentor";
import SignupMentee from "../components/SignupMentee";
import { useState } from 'react';
export default function SignupPage(){
    const [isMentor,setIsMentor]=useState(false);
    return(
        <>
            <Header
              heading="Signup to create an account"
              paragraph="Already have an account? "
              linkName="Login"
              linkUrl="/"
            />
            {isMentor===true &&<SignupMentor/>}
            {isMentor===true &&<SignupMentee/>}
        </>
    )
}
