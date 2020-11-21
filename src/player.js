import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import screenfull from 'screenfull';
import loadinggif from './loading.gif';
import Cookie from 'cookie';

class Player extends Component
{
    state = {tree : null, current_video: null, final: false, choices: [], time_when_choice: null, liked: null}

    async componentDidMount()
    {
       this.preLaunchFunction();
    }

    render() {
        return (<div className="container" id="video1">
        <div id="video-comp" className="c-video">
        <div id="header">
        <button className="close" onClick={() => this.props.app_parent.setState({ mode: "browse_main", vid_id: null, tree: null, user: this.props.app_parent.state.user })}/>
        <h2 id="title" style={{marginBottom: "1px"}}>{!this.state.tree ? null : this.state.tree.video_title}</h2>
        <button id="like-button" title={this.props.app_parent.user != null ? "Log in to use this functionality" : ""} onClick={() => this.processLike()} style={{display: "inline", paddingRight: "10px"}} className="like"/>
        <h3 id="like-indicator" style={{display: "inline"}}>-</h3>
        </div>
        <div id="video-container">
            <img width="140" height="142" id="buffering" className="buffering hidden" src={loadinggif}/>
            <video id="video-src" src={this.fetchVideo()} onLoadStart={() => document.getElementById("buffering").className = "buffering"} onCanPlay={() => document.getElementById("buffering").className = "buffering hidden"} onWaiting={() => document.getElementById("buffering").className = "buffering"} onPlaying={() => this.getChoiceShowDuration()}  className="video" onEnded={() => this.endFunction()} onTimeUpdate={() => this.checkChoiceShow()} onError={() => this.globalError()} autoPlay></video>
            <div id="choice-time-ran-out" className="pop-up-msg hidden">No choice was made in the time limit, a random choice was selected.</div>
            <div id="butterflylogo" className="butterflylogo hidden"></div>
            <div className="hidden" id="choices">
            <div id="inner-choices"></div>
            </div>
            <div class="controls">
            <div id="timer-bar" className="timer-bar hidden">
            <div id="timer-fill" class="timer-fill"/>
            </div>
                <div class="buttons">
                    <button onClick={() => this.handlePlayButton()} id="play-pause" className="pause"/>
                    <button onClick={() => document.getElementById("video-src").currentTime = document.getElementById("video-src").currentTime - 10} id="rewind" className="rewind"/>
                    <button onClick={() => this.handleFullScreen()} id="fullscreen" className="fullscreen"/>
                    <h3 className="subtitle">{this.state.tree ? this.getCurrentTitle() : null}</h3>
                </div>
            </div>
            </div>
        </div>
        <div style={{display: "none"}} id="end-title">
            <h2>The content has ended.</h2>
            <button className="white" onClick={() => this.props.app_parent.setState({ mode: "browse_main", vid_id: null, tree: null, user: this.props.app_parent.state.user })}>Return to main page</button>
        </div>
        <div style={{display: "none"}} id="error-screen">
            <h2>An error occurred.</h2>
            <h3>Please try again later.</h3>
            <button className="white" onClick={() => this.props.app_parent.setState({ mode: "browse_main", vid_id: null, tree: null, user: this.props.app_parent.state.user })}>Return to main page</button>
        </div>
        <div style={{display: "none"}} id="prereq-missing">
            <h2>This content requires prerequisite.</h2>
            <h4 style={{color: "white"}}>Please log in and complete the following content first.</h4>
            <div id="prereq">
                <img width="75" height="78" id="prereq_loading" src={loadinggif}/>
            </div>
            <br></br>
            <button className="white" onClick={() => this.props.app_parent.setState({ mode: "browse_main", vid_id: null, tree: null, user: this.props.app_parent.state.user })}>Return to main page</button>
        </div>
       </div>
    )
    };

    async preLaunchFunction()
    {
        let resp = await fetch("https://interact-server.herokuapp.com/get-video/" + this.props.vid_id)
        .then(r => r.json());
        document.getElementById("like-indicator").innerHTML = resp[0].likes;
        if(resp[0].prerequisite != null)
        {
            let prereq = await this.getPreReqChoices(resp[0].prerequisite);
            if(prereq == false) return;
        }
        this.getLikes();
        this.setState({tree : this.props.tree, current_video: "start", 
        final: false, choices: this.state.choices, time_when_choice: null, liked: null},() => this.handleEvent("start"));
    }

    async getLikes()
    {
        if(this.props.app_parent.state.user)
        {
            let resp2 = await fetch("http://interact-server.herokuapp.com/get-fav-videos/" + this.props.app_parent.state.user)
                                .then(r => r.json());
            resp2 = resp2[0];
            for(let x = 0; x < resp2.likes.length; x++)
            {
                if(resp2.likes[x] == this.props.vid_id)
                {
                    console.log("liked")
                    this.setState({tree : this.state.tree, current_video: this.state.current_video, 
                    final: this.state.final, choices: this.state.choices, time_when_choice: this.state.time_when_choice, 
                    liked: true})
                    document.getElementById("like-button").className = "like liked";
                    return;
                }
            }
            console.log("not liked")
            this.setState({tree : this.state.tree, current_video: this.state.current_video, 
                final: this.state.final, choices: this.state.choices, time_when_choice: this.state.time_when_choice, 
                liked: false})
        }
    }

    async getPreReqChoices(prereq_id)
    {
        let cookies = Cookie.parse(document.cookie);
        let resp = undefined;
        if(cookies.session_user && cookies.session_token)
        {
            resp = await fetch("https://interact-server.herokuapp.com/prereq-choices",{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                       token: cookies.session_token,
                       vidid: prereq_id}),
            }).then(r => r.json());
        }
        else resp = [];
        console.log(resp);
        if(resp.length == 0)
        {
            document.getElementById("video-comp").style.display = "none";
            document.getElementById("prereq-missing").style.display = "block";
            this.getPreRequisiteVideoComponent();
            return false;
        }
        else
        {
            //using prereq choices
            this.setState({tree : null, current_video: null, 
                final: false, choices: resp[0].choices, time_when_choice: null, 
                liked: null});
            return true;
        }
    }

    async processLike()
    {
        //getting token cookie
        let cookies = Cookie.parse(document.cookie);
        if(cookies.session_token)
        {
            let action = undefined;
            if(this.state.liked == true) action = "DELETE";
            else if(this.state.liked == false) action = "PUT";
            let resp = await fetch("https://interact-server.herokuapp.com/like",{
            method: action,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({token: cookies.session_token,
                   video_id: this.props.vid_id}),
            })
            .then(r => r.text());

            if(resp == "OK")
            {
                if(action == "PUT")
                {
                    document.getElementById("like-button").className = "like liked";
                    document.getElementById("like-indicator").innerHTML = Number(document.getElementById("like-indicator").innerHTML) + 1;
                    this.setState({tree : this.state.tree, current_video: this.state.current_video, 
                        final: this.state.final, choices: this.state.choices, time_when_choice: this.state.time_when_choice, 
                        liked: true})
                }
                else if(action == "DELETE")
                {
                    document.getElementById("like-button").className = "like";
                    document.getElementById("like-indicator").innerHTML = Number(document.getElementById("like-indicator").innerHTML) - 1;
                    this.setState({tree : this.state.tree, current_video: this.state.current_video, 
                        final: this.state.final, choices: this.state.choices, time_when_choice: this.state.time_when_choice, 
                        liked: false})
                }
            } 
        }
    }

    handleFullScreen()
    {
        if (screenfull.isEnabled)
        {
            if(!screenfull.isFullscreen)
            {
                screenfull.request(document.getElementById("video-container"));
            }
            else
            {
                screenfull.exit(); 
            }
        }
    }

    //Optimize required
    handleEvent(vidid)
    {
        console.log(vidid)
        if(vidid == "start")
        {
            if(this.state.tree.start_video.event)
            {
                if (this.state.tree.start_video.event.type == "choice") this.produceChoices(vidid)
            }
        }
        else
        {
            let vidobj = this.findVideoPathObject(vidid)

            if(vidobj.event)
            {
                if (vidobj.event.type == "choice") this.produceChoices(vidid)
            }
        }
    }

    //optional: optimize setting react state
    changeCurrentVideo(vidid,choice)
    {
        let new_choices = this.state.choices
        if(choice) new_choices.push(choice)
        document.getElementById("choices").className = "hidden";
        document.getElementById("timer-bar").className = "timer-bar hidden";
        ReactDOM.unmountComponentAtNode(document.getElementById("inner-choices"))
        if(this.findVideoPathObject(vidid).event) this.setState({tree : this.state.tree, current_video: vidid, final: false, choices: new_choices, time_when_choice: null, liked: this.state.liked})
        else this.setState({tree : this.state.tree, current_video: vidid, final: true, choices: new_choices, time_when_choice: null, liked: this.state.liked})
        this.handleEvent(vidid)
        this.toggleController(true);
    }

    getChoiceShowDuration()
    {
        let vidobj = null;
        if(this.state.current_video == "start") vidobj = this.state.tree.start_video;
        else vidobj = this.findVideoPathObject(this.state.current_video)
        let vidduration = document.getElementById("video-src").duration
        if(vidobj.event)
        {
            this.setState({tree : this.state.tree, 
                current_video: this.state.current_video, 
                final: this.state.final, choices: this.state.choices, 
                time_when_choice:(vidduration - vidobj.event.duration), liked: this.state.liked})
        }
    }

    getCurrentTitle()
    {
        if(this.state.current_video == "start") return this.state.tree.start_video.title
        else return this.findVideoPathObject(this.state.current_video).title
    }

    checkChoiceShow()
    {
        if(this.state.time_when_choice)
        {
            if(document.getElementById("video-src").currentTime >= this.state.time_when_choice)
            {
                let vidobj = null;
                if(this.state.current_video == "start") vidobj = this.state.tree.start_video;
                else vidobj = this.findVideoPathObject(this.state.current_video)
                this.showChoices(vidobj.event.duration)
                this.setState({tree : this.state.tree, 
                    current_video: this.state.current_video, 
                    final: this.state.final, choices: this.state.choices, 
                    time_when_choice: null, liked: this.state.liked})
            }
        }
    }

    //Optimize
    produceChoices(vidid)
    {
        var vidobj = null;
        if(vidid == "start") vidobj = this.state.tree.start_video;
        else vidobj = this.findVideoPathObject(vidid)
        var temp_choices = <div id="temp-choices"><button gateway={vidobj.event.gateway.one} id="decision1" onClick={e => this.changeCurrentVideo(e.target.getAttribute("gateway"),e.target.innerHTML)} className="decision decision1">{vidobj.event.choices.one}</button>
        <button gateway={vidobj.event.gateway.two} id="decision2" onClick={e => this.changeCurrentVideo(e.target.getAttribute("gateway"),e.target.innerHTML)} className="decision decision2">{vidobj.event.choices.two}</button></div>
        ReactDOM.render(temp_choices,document.getElementById("inner-choices"))
    }

    handlePlayButton()
    {
        var button = document.getElementById("play-pause")
        if(button.className == 'play') {
            document.getElementById("video-src").play()
            button.className = 'pause';
        } else {
            document.getElementById("video-src").pause()
            button.className = 'play';
        }
    }

    showChoices(time)
    {
        document.getElementById("choices").className = "shown";
        document.getElementById("timer-bar").className = "timer-bar shown";
        this.setTimer(time)
        this.toggleController(false);
    }

    //Optimize
    videoDurationEnded()
    {
        let vidobj = null;
        if(this.state.current_video == "start") vidobj = this.state.tree.start_video;
        else vidobj = this.findVideoPathObject(this.state.current_video)

        if(vidobj.event)
        {
            if(vidobj.event.type == "choice") this.randomizeSelection(vidobj)
            if(vidobj.event.type == "butterfly") this.getButterflyResult(vidobj)
            if(vidobj.event.type == "linear") this.changeCurrentVideo(vidobj.event.gateway,null)
        }
    }

    getButterflyResult(vidobj)
    {
        for(let j = 0; j < vidobj.event.required_choices.length; j++)
        {
            if(this.state.choices.includes(vidobj.event.required_choices[j]))
            {
                this.changeCurrentVideo(vidobj.event.gateway[j],null);
                document.getElementById("butterflylogo").className = "butterflylogo shown";
                setTimeout(() => { if(document.getElementById("butterflylogo") != null) document.getElementById("butterflylogo").className = "butterflylogo hidden"; },5000);
                return;
            }
        }

        this.endFunction(true);
    }

    randomizeSelection(vidobj)
    {
        let rand = Math.floor(Math.random() * 2) + 1;

        if(rand == 1) this.changeCurrentVideo(vidobj.event.gateway.one,vidobj.event.choices.one)
        else if(rand == 2) this.changeCurrentVideo(vidobj.event.gateway.two,vidobj.event.choices.two)

        document.getElementById("choice-time-ran-out").className = "pop-up-msg shown"
        setTimeout(() => document.getElementById("choice-time-ran-out").className = "pop-up-msg hidden",3000)
    }

    setTimer(time)
    {
        let fullamount = time * 1000;
        let amount = time * 1000;
        let interval = setInterval(() => 
        {
            try
            {
                amount -= 15;
                if(amount < 0)
                {
                    clearInterval(interval);
                }
                else document.getElementById("timer-fill").style.width = (amount/fullamount * 100) + "%"
            }
            catch (error)
            {
                clearInterval(interval);
            }
        },15)
    }

    fetchVideo()
    {
        if(this.state.current_video)
        {
            if(this.state.current_video == "start")
            {
               return "https://interact-videos.s3.eu-central-1.amazonaws.com/" + this.state.tree.start_video.id;
            }
            else return "https://interact-videos.s3.eu-central-1.amazonaws.com/" + this.state.current_video;
        }
    }

    //!!!Rewrite this to support start video object return
    findVideoPathObject(vidid)
    {
        for(let i = 0; i < this.state.tree.videos.length; i++)
        {
            if(this.state.tree.videos[i].id == vidid) return this.state.tree.videos[i]
        }

        return null;
    }

    endFunction(autoend = false)
    {
        if(this.state.final == true || autoend == true)
        {
           document.getElementById("video-comp").style.display = "none";
           document.getElementById("end-title").style.display = "block";
           this.uploadChoices();
        }
        else {
           this.videoDurationEnded();
        }

    }

    toggleController(value)
    {
        document.getElementById("play-pause").disabled = !value;
        document.getElementById("rewind").disabled = !value;
    }

    globalError()
    {
        document.getElementById("video-comp").style.display = "none";
        document.getElementById("error-screen").style.display = "block";
    }

    async getPreRequisiteVideoComponent()
    {
        let resp = await fetch("https://interact-server.herokuapp.com/get-video/" + this.props.vid_id)
        .then(r => r.json());

        let prereq = await fetch("https://interact-server.herokuapp.com/get-video/" + resp[0].prerequisite)
        .then(r => r.json());

        let prereq_prev = "https://interact-videos.s3.eu-central-1.amazonaws.com/previews/" + prereq[0].preview_id;

        ReactDOM.render(
        <div onClick={() => this.props.app_parent.updateVideo(resp[0].prerequisite)} style={{cursor: "pointer"}} id="video-button">
            <img src={prereq_prev} id="prereqpreview" width="200px" height="120px"></img>
            <div>
                <label style={{color:"white", cursor: "pointer"}} style={{paddingBottom: "5px", paddingLeft: "5px", fontSize: "20px"}}><b style={{color: "white"}}>{prereq[0].name}</b></label>
                <label style={{color:"white", paddingBottom: "5px", paddingLeft: "5px", fontSize: "11px"}}>{prereq[0].description.substring(0,100)}</label>
            </div>
        </div>,document.getElementById("prereq"));
    }

    async uploadChoices()
    {
        let cookies = Cookie.parse(document.cookie);
        if(cookies.session_user != null && cookies.session_token != null)
        {
            let resp = await fetch("https://interact-server.herokuapp.com/upload-choices",{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                       token: cookies.session_token,
                       vidid: this.props.vid_id,
                       choices: this.state.choices}),
            }).then(r => r.text());
            if(resp == "OK") console.log("choices successfully uploaded");
            else console.log("choice upload failed");
        }
        else console.log("no choice uploaded - no login");
    }
}

export default Player;