// Created by Lukas Xue 11/2022


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';
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


let Content = "";

const querySnapshot = await getDocs(collection(db, "users"));
querySnapshot.forEach((doc) => {
  let row = JSON.stringify(doc.data());
  Content += row + "\r\n";
});

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

download('test.txt', Content);