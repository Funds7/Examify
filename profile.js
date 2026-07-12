import { auth, db } from "./firebase.js";


import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



onAuthStateChanged(auth, async(user)=>{


if(user){


const userSnap = await getDoc(
doc(db,"users",user.uid)
);



if(userSnap.exists()){


const data = userSnap.data();



document.getElementById("profileName").innerHTML =
data.name;


document.getElementById("profileEmail").innerHTML =
data.email;


document.getElementById("profileCoins").innerHTML =
data.coins;



}


}

else{

window.location.href="login.html";

}



});




// LOGOUT

document.getElementById("logoutBtn")
.addEventListener("click", async()=>{


try{


await signOut(auth);


alert("Logged out successfully 👋");


window.location.href="login.html";


}


catch(error){

alert(error.message);

}


});
