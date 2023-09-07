import clsx from 'clsx';
import classes from './CastVote.module.css';
import Button from "../Button";
import React, {useEffect, useRef, useState} from "react";
import {LoadingButton} from "@mui/lab";
import {useAccount} from "wagmi";
import ConnectButton from "../ConnectButton";
import dayjs from "dayjs";



const CastVote: React.FC<{
    onClickVote: (id:number) => void;
    options: any[];
    canVote:number;
    voteOptionId:number;
    loading?:boolean;
    endTime:string;
}> = props => {

    const { options,voteOptionId,endTime } = props;
    const [optionId, setOptionId] = useState(0);
    const { address: account } = useAccount();
    const [isEnd,setIsEnd] = useState(false);


    useEffect(() => {
        countDown();
    },[voteOptionId,endTime]);

    const onClickItem = (e:any,id:number) =>{
        setOptionId(id);
    }

    const addZero = (i:number)=>{
        return i < 10 ? "0" + i: i + "";
    }

    const  countDown = ()=> {
        setIsEnd(false);

        let nowtime = new Date();

        let endtime = new Date(dayjs(endTime).tz().format('YYYY-MM-DD HH:mm'));
        let lefttime = parseInt((endtime.getTime() - nowtime.getTime()) / 1000);


        // console.log(endTime);
        // console.log(dayjs(endTime).tz().format('YYYY-MM-DD HH:mm'));
        // console.log(nowtime);


        let d = parseInt(lefttime / (24*60*60))
        let h = parseInt(lefttime / (60 * 60) % 24);
        let m = parseInt(lefttime / 60 % 60);

        d = addZero(d)
        h = addZero(h);
        m = addZero(m);

        let dStr = d <= 1 ? 'day':'days';
        let hStr = d <= 1 ? 'hour':'hours';
        let mStr = d <= 1 ? 'minute':'minutes';


        document.querySelector(".count").innerHTML = `<span class="castVoteEnds">Voting ends in <span class="num">${d}</span> ${dStr} <span class="num">${h}</span> ${hStr}  <span class="num">${m}</span> ${mStr}</span>`;

        if (lefttime <= 0) {
            setIsEnd(true);
            document.querySelector(".count").innerHTML = `<span class="castVoteEnded">Voting ended</span>`;
        }
    }



    return (<div className={classes.castVote}>
        <div className={classes.title}>Cast Your Vote</div>
        <div className={'count'}></div>
        {
            options.length > 0 && (
                <div className={classes.options}>
                    {
                        options.map(item => (
                            <div
                                onClick={e=>{onClickItem(e,item.id)}}
                                className={clsx(classes.item,optionId==item.id && classes.activeItem)}
                                id={item.id}
                                key={item.id}>
                                <div className={classes.desc}>{item.description}</div>
                            </div>
                        ))
                    }
                </div>
            )
        }
        {
            isEnd ? (
                <></>
            ):(
                <div className={classes.footer}>

                    {account?(
                        <button
                            className={classes.voteBtn}
                            onClick={event => {
                                props.onClickVote(optionId)
                            }}
                        >
                            Vote
                            <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.41333 12.7184C9.76 13.0694 10.32 13.0694 10.6667 12.7184L16.32 6.99481C16.4024 6.91155 16.4678 6.81266 16.5124 6.70379C16.557 6.59492 16.58 6.47821 16.58 6.36035C16.58 6.24248 16.557 6.12578 16.5124 6.01691C16.4678 5.90804 16.4024 5.80915 16.32 5.72589L11.92 1.27119C11.8398 1.18624 11.7436 1.11846 11.637 1.07188C11.5304 1.0253 11.4157 1.00086 11.2997 1.00002C11.1836 0.999183 11.0685 1.02196 10.9613 1.06699C10.8541 1.11203 10.7569 1.17841 10.6756 1.26219L5.01333 6.99481C4.93093 7.07806 4.86555 7.17696 4.82095 7.28582C4.77634 7.39469 4.75338 7.5114 4.75338 7.62926C4.75338 7.74713 4.77634 7.86383 4.82095 7.9727C4.86555 8.08157 4.93093 8.18046 5.01333 8.26372L9.41333 12.7184ZM11.2978 3.17006L14.4444 6.35585L10.0444 10.8106L6.89778 7.62476L11.2978 3.17006ZM17.4756 13.0694L15.5911 11.1615C15.4311 10.9995 15.2 10.9005 14.9689 10.9005H14.7289L12.9511 12.7004H14.6489L16.2222 14.5003H3.77778L5.36 12.7004H7.18222L5.40444 10.9005H5.03111C4.79111 10.9005 4.56889 10.9995 4.4 11.1615L2.51556 13.0694C2.18667 13.4114 2 13.8703 2 14.3473V17.2001C2 18.1901 2.8 19 3.77778 19H16.2222C16.4557 19 16.6869 18.9534 16.9025 18.863C17.1182 18.7725 17.3142 18.64 17.4793 18.4728C17.6444 18.3057 17.7753 18.1073 17.8647 17.8889C17.954 17.6705 18 17.4365 18 17.2001V14.3473C18 13.8703 17.8133 13.4114 17.4756 13.0694Z" fill="#111111"/>
                            </svg>
                        </button>
                    ):(
                        <ConnectButton
                            classNames="connectBtn"
                        />
                    )}

                </div>
            )
        }




    </div>);
};

export default CastVote;
