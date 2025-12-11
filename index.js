import { tweetsDataDefault } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData = []
// localStorage.clear()

if ( JSON.parse(localStorage.getItem("tweetsDataFromLS")) ){
    tweetsData = JSON.parse(localStorage.getItem("tweetsDataFromLS"))
} else {
    tweetsData = tweetsDataDefault
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    } 
    else if(e.target.dataset.replyBtn){
        handleReplyEnter(e.target.dataset.replyBtn)
    }
    else if(e.target.dataset.cancelComment){
        handleCancelCommentClick(e.target.dataset.cancelComment, e.target.dataset.cancel)
    }
    else if(e.target.dataset.cancel){
        handleCancelClick(e.target.dataset.cancel)
    }
    

    localStorage.setItem("tweetsDataFromLS", JSON.stringify(tweetsData))
})

document.addEventListener('keydown', function(e) {
    if (e.key === "Enter" && e.shiftKey && e.target.dataset.yourReply) {
        e.preventDefault()
        handleReplyEnter(e.target.dataset.yourReply)
    } else if (e.key === "Enter" && e.shiftKey && e.target.id === 'tweet-input') {
        e.preventDefault()
        handleTweetBtnClick()
    }

    localStorage.setItem("tweetsDataFromLS", JSON.stringify(tweetsData))
})
 
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

function handleReplyClick(replyId){
    const targetTweetObj = tweetsData.filter(function(tweet) {
        return tweet.uuid === replyId
    })[0]

    targetTweetObj.isCommentHidden = !(targetTweetObj.isCommentHidden)
    render()
}

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

function handleReplyEnter(tweetId) {
    const targetTweetObj = tweetsData.filter( function(tweet) {
        return tweet.uuid === tweetId
    })[0]

    let yourReply = document.getElementById(`your-reply-to-${tweetId}`).value

    targetTweetObj.replies.push({
        handle: `@Scrimba`,
        profilePic: `images/scrimbalogo.png`,
        tweetText: yourReply,
        uuid: uuidv4(),
    })

    render()
    yourReply = ""

}

function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }

        let hiddenClass = "hidden"
        if (!(tweet.isCommentHidden)) {
            hiddenClass = ""
        }

        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){

                const isUserReply = (reply.handle === "@Scrimba") ? true : false

                repliesHtml+=`
                    <div class="tweet-reply">
                        <div class="tweet-inner">
                            <img src="${reply.profilePic}" class="profile-pic">
                                <div>
                                    <p class="handle">${reply.handle}</p>
                                    <p class="tweet-text">${reply.tweetText}</p>
                                </div>
                        </div>   
                    `
                if (isUserReply) {
                    repliesHtml += `
                        <div class="cancel-btn">
                        <img 
                            src="./images/close-x.svg" 
                            data-cancel-comment="${reply.uuid}" 
                            data-cancel="${tweet.uuid}"/>
                        </div>
                    `
                }
                    
                repliesHtml += `
                    </div>
                    `
                    
            })
        }

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
        
          
        feedHtml += `
            <div class="tweet">
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
            `
        const isUserTweet = (tweet.handle === "@Scrimba") ? true : false
        if (isUserTweet) {
            feedHtml += `
            <div class="cancel-btn" >
                <img 
                    src="./images/close-x.svg" 
                    data-cancel="${tweet.uuid}"/>
            </div>
            `
        } 
    
        feedHtml += `
            </div>
            `
   })
   
   

   return feedHtml 
}


function handleCancelClick(tweetId) {
    
    const targetTweetObjIndex = tweetsData.findIndex(function(tweet) {
        return tweet.uuid === tweetId
    })
    tweetsData.splice(0, targetTweetObjIndex+1)

    render()
}



function handleCancelCommentClick(replyId, tweetId) {
    const targetTweetObj = tweetsData.filter( function(tweet) {
        return tweet.uuid === tweetId
    })[0]
    const targetReplyIndex = targetTweetObj.replies.findIndex( function(reply) {
        return reply.uuid === replyId
    })

    targetTweetObj.replies.splice(0, targetReplyIndex+1)

    render()
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()
