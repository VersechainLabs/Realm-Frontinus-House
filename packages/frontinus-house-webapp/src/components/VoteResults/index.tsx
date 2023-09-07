import clsx from 'clsx';
import classes from './VoteResults.module.css';
import Button from "../Button";
import React, {useEffect, useState} from "react";




const VoteResults: React.FC<{
    options: any[];
    quorum:number;
    voteCount:number;
    quorumPercentage:string;
    symbol?:string;
}> = props => {
    const { options,quorum } = props;

    useEffect(() => {
    },[]);



    return (<div className={classes.voteResults}>
        <div className={classes.title}>Current Results</div>
        {
            options.length > 0 && (
                <div className={classes.options}>
                    {
                        options.map(item => (
                            <div className={classes.item} key={item.id}>

                                <div className={classes.first}>
                                    <div className={classes.left}>{item.description}</div>
                                    <div className={classes.right}>
                                        <div>{item.voteCount}</div>
                                        <div className={classes.symbol}>{props.symbol}</div>
                                        <div className={classes.percent}>{item.percentage}%</div>
                                    </div>
                                </div>

                                <div className={classes.progress}>
                                    <div className={clsx(classes.bgLine,classes.bg)}>
                                        <div className={clsx(classes.line,classes.inner)} style={{
                                            width:item.percentage+'%'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }

                    <div className={classes.item}>

                        <div className={classes.first}>
                            <div className={classes.left}>Quorum</div>
                            <div className={classes.right}>
                                {props.voteCount}&ensp;/&ensp;{props.quorum}
                            </div>
                        </div>

                        <div className={classes.progress}>
                            <div className={clsx(classes.bgLine,classes.bg)}>
                                <div className={clsx(classes.line,classes.inner)} style={{
                                    width:props.quorumPercentage+'0%'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    </div>);
};

export default VoteResults;
