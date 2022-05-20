"use strict";

 function updateLikes(id){
     console.log(id);
    $.ajax({
    url: "http://localhost:8000/like?imageID="+id,
    method: "POST",
    success: function (result){
    //if the user is not logged in
    if(result === "noSessiondata"){
        self.location = "http://localhost:8000/login";
    }
    if(result === "alreadyLiked"){
    //if the user has liked the image, verified via string result from server
        alert("You have already liked this image")
    }
    else{
    //if the user is logged in, use jQuery to increase likes by 1 via new result
        if(result != "noSessiondata"){
    document.getElementById(id).innerHTML = result;
    }
    }
    }
});
}

function updateComments(){
    $.ajax({
    url: "http://localhost:8000/",
    success: function (result){
    //clear textbox used by user to comment
    $(".textArea").val('');
    }
});
}
