// Created by Chen Gong 11/2022

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';
const firebaseConfig = {
  apiKey: "AIzaSyAjyjdZQxPKki7o_bcD28DIvNvK1YDM7ZU",
  authDomain: "trend-survey.firebaseapp.com",
  projectId: "trend-survey",
  storageBucket: "trend-survey.appspot.com",
  messagingSenderId: "269130863233",
  appId: "1:269130863233:web:a9444b1824f73455347380"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// try {
//   const docRef = await setDoc(doc(db, "users", `${id}`), {["user_id"]: id}, {merge: true});
// } catch (e) {
//   console.error("Error adding document: ", e);
// }
// var form = document.getElementById("survey-form")
// form.setAttribute("onsubmit", check_form())
function check_form() {
  console.log("testtestsetestsets")
  var id = document.getElementById("prolific_id").value
  var age = document.getElementById("age").value
  var gender = document.getElementById("gender").value
  var education = document.getElementById("education").selectedIndex
  var race = document.getElementById("race").selectedIndex
  var visfam = document.getElementById("visfam").selectedIndex

  if (id == "") {
    window.alert("Please enter your Prolific ID.");
    return false;
  } else if (age == "") {
    window.alert("Please enter your age.");
    return false;
  } else if (race == 0) {
    window.alert("Please select your race/ethnicity.");
    return false;
  } else if (gender == 0) {
    window.alert("Please select your gender.");
    return false;
  } else if (education == 0) {
    window.alert("Please select your education.");
    return false;
  } else if (visfam == 0) {
    window.alert("Please select your familiarity with data visualization.");
    return false;
  }



  return true

}