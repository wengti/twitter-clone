import { tweetsDataDefault } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

//                                          --- Setup / Initialization ---
// Decide whether to load the tweetsData from Local Storage or from default JS
let tweetsData = []
if ( JSON.parse(localStorage.getItem("tweetsDataFromLS")) ){
    tweetsData = JSON.parse(localStorage.getItem("tweetsDataFromLS"))
} else {
    tweetsData = tweetsDataDefault
}

// Call the render upon loading the page
render()



//                                          --- Event Listener ---
// For all the click events
document.addEventListener('click', function(e){
    
    if(e.target.dataset.like){                          //When like icon is clicked
       handleLikeClick(e.target.dataset.like) 
    }                                                   //When retweet icon is clicked
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }                                                   //When reply icon is clicked
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }                                                   //When the tweet btn (at the top) is clicked
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }                                                   //When the tweet reply (for comment) is clicked
    else if(e.target.dataset.replyBtn){
        handleReplyEnter(e.target.dataset.replyBtn)
    }                                                   //When the X btn is clicked at the comment section
    else if(e.target.dataset.cancelComment){
        handleCancelCommentClick(e.target.dataset.cancelComment, 
                                e.target.dataset.cancel)
    }
    else if(e.target.dataset.cancel){                   //When the X btn is clicked at the post section
        handleCancelClick(e.target.dataset.cancel)
    }
    
    // Once an interaction is completed, the updated tweetsData array is saved to Local Storage
    localStorage.setItem("tweetsDataFromLS", JSON.stringify(tweetsData))
})


// For all the shift + enter event
document.addEventListener('keydown', function(e) {
    if (e.key === "Enter" && e.shiftKey && e.target.dataset.yourReply) {        //When this event happens for new reply
        e.preventDefault() // Prevent an extra newline after input
        handleReplyEnter(e.target.dataset.yourReply)
    } else if (e.key === "Enter" && e.shiftKey && e.target.id === 'tweet-input') { //When this event happens for new tweet
        e.preventDefault() // Prevent an extra newline after input
        handleTweetBtnClick()
    }

    // Once an interaction is completed, the updated tweetsData array is saved to Local Storage
    localStorage.setItem("tweetsDataFromLS", JSON.stringify(tweetsData))
})



//                                          --- Functions for Event Listener ---
//When like icon is clicked
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

//When retweet icon is clicked
function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render() 
}

//When reply icon is clicked
function handleReplyClick(replyId){
    const targetTweetObj = tweetsData.filter(function(tweet) {
        return tweet.uuid === replyId
    })[0]

    targetTweetObj.isCommentHidden = !(targetTweetObj.isCommentHidden)
    render()
}

//When the tweet btn (at the top) is clicked or sent with shift + enter
function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            isCommentHidden: true,
            uuid: uuidv4()
        })
    render()
    tweetInput.value = ''
    }

}


//When the tweet reply (for comment) is clicked or sent with shift + enter
function handleReplyEnter(tweetId) {
    let yourReply = document.getElementById(`your-reply-to-${tweetId}`).value

    if (yourReply){
        const targetTweetObj = tweetsData.filter( function(tweet) {
            return tweet.uuid === tweetId
        })[0]

        

        targetTweetObj.replies.push({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: yourReply,
            uuid: uuidv4(),
        })

        render()
        yourReply = ""
        }
}

//When the X btn is clicked at the comment section
function handleCancelCommentClick(replyId, tweetId) {
    const targetTweetObj = tweetsData.filter( function(tweet) {
        return tweet.uuid === tweetId
    })[0]
    const targetReplyIndex = targetTweetObj.replies.findIndex( function(reply) {
        return reply.uuid === replyId
    })
    targetTweetObj.replies.splice(targetReplyIndex, 1)

    render()
}

//When the X btn is clicked at the post section
function handleCancelClick(tweetId) {

    const targetTweetObjIndex = tweetsData.findIndex(function(tweet) {
        return tweet.uuid === tweetId
    })
    tweetsData.splice(0, targetTweetObjIndex+1)

    render()
}

//                                          --- For Rendering The Page ---
function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

function getFeedHtml(){

    // Initialize the overall content for rendering
    let feedHtml = ``
    
    // Iterate over each object / tweet in tweetsData
    tweetsData.forEach(function(tweet){
        
        // check boolean flags in tweetsDat to decide 
        // the rendering of like icons, retweet icons and comment section
        let likeIconClass = (tweet.isLiked) ? "liked" : ""
        let retweetIconClass = (tweet.isRetweeted) ? "retweeted" : ""
        let hiddenClass = (tweet.isCommentHidden) ? "hidden" : ""
        
        // Initialize the content for comment / replies section
        let repliesHtml = ''
        
        // Iterate over EACH REPLY OBJECT
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){

                
                // The first div for this section
                repliesHtml += `
                    <div class="tweet-reply">
                    `
                
                // Check if the reply belongs to the current user
                //Add X button if it belongs to the current user (so it can be deleted)
                const isUserReply = (reply.handle === "@Scrimba") ? true : false
                if (isUserReply) {
                    repliesHtml += `
                        <div class="cancel-btn">
                        <img 
                            src="./images/close-x.svg" 
                            data-cancel-comment="${reply.uuid}" 
                            data-cancel="${tweet.uuid}"/
                            tabindex="0">
                        </div>
                    `
                }

                repliesHtml+=`
                        <div class="tweet-inner">
                            <img src="${reply.profilePic}" class="profile-pic">
                                <div>
                                    <p class="handle">${reply.handle}</p>
                                    <p class="tweet-text">${reply.tweetText}</p>
                                </div>
                        </div>  
                    </div>
                    `        
            })
        }
        // End of iterating over EACH REPLY OBJECT 

        // Continue populating the content for comment sections
        // with the reply text box
        repliesHtml += `
            <div class="your-tweet-reply">
                <div class="your-tweet-inner-reply">
                        <textarea 
                            placeholder="Post your reply"
                            data-your-reply = "${tweet.uuid}"
                            id = "your-reply-to-${tweet.uuid}"></textarea>
                        <button data-reply-btn="${tweet.uuid}">
                            <i class="fa-solid fa-reply white-color"
                            data-reply-btn="${tweet.uuid}">
                            </i>
                        </button>
                </div>
            </div>
            `    
        
        // Populating the overall content to be rendered (for a single tweet)
        // The replies content created above is included here 

        // The first div for this section
        feedHtml += `
            <div class="tweet">
            `
        
        // Check if the tweet belongs to the current user
        //Add X button if it belongs to the current user (so it can be deleted)
        const isUserTweet = (tweet.handle === "@Scrimba") ? true : false
        if (isUserTweet) {
            feedHtml += `
            <div class="cancel-btn" >
                <img 
                    src="./images/close-x.svg" 
                    data-cancel="${tweet.uuid}"
                    tabindex="0"/>
            </div>
            `
        } 
        
        // Populate the entire content for a single tweet (including the hidden replies)
        feedHtml += `
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${tweet.handle}</p>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-details">
                            <span class="tweet-detail" >
                                <i class="fa-regular fa-comment-dots"
                                data-reply="${tweet.uuid}" tabindex="0"
                                ></i>
                                ${tweet.replies.length}
                            </span>
                            <span class="tweet-detail" >
                                <i class="fa-solid fa-heart ${likeIconClass}"
                                data-like="${tweet.uuid}" tabindex="0"
                                ></i>
                                ${tweet.likes}
                            </span>
                            <span class="tweet-detail" >
                                <i class="fa-solid fa-retweet ${retweetIconClass}"
                                data-retweet="${tweet.uuid}" tabindex="0"
                                ></i>
                                ${tweet.retweets}
                            </span>
                        </div>   
                    </div>            
                </div>
                <div class="${hiddenClass}" id="replies-${tweet.uuid}">
                    ${repliesHtml}                            
                </div>   
            </div>
            `        
   })
   

   return feedHtml 
}







