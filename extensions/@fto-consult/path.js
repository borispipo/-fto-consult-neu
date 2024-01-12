const {client,id,port,token} = require("./client");
const path = require("path");

client.registerCallback(({message,client,data,...rest})=>{
    console.log(message," is message ",data,rest," aaaaaaaaaaaaaaa");
});