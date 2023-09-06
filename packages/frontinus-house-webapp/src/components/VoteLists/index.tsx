import clsx from 'clsx';
import classes from './VoteLists.module.css';
import Button from "../Button";
import React, {useEffect, useRef, useState} from "react";
import {LoadingButton} from "@mui/lab";
import {useAccount} from "wagmi";
import ConnectButton from "../ConnectButton";
import AddressAvatar from "../AddressAvatar";
import EthAddress from "../EthAddress";
import {Container} from "react-bootstrap";
import VoteListPopup from "../VoteListPopup";



const VoteLists: React.FC<{
    bipVotes: any[];
    voteCount:number;
}> = props => {

    const { bipVotes,voteCount } = props;

    useEffect(() => {
    },[]);

    const [showPopup, setShowPopup] = useState(false);
    const [showChild,setShowChild] = useState([]);


    const closePopup = () => {
        setShowPopup(false)
    };
    const openPopop = () => {
        setShowPopup(true)
    };

    return (
        <div>

            {showPopup && (
                <VoteListPopup
                    voteCount={voteCount}
                    trigger={true}
                    onClose={closePopup}
                    voteList={bipVotes}
                />
            )}

            {
                bipVotes.length > 0 &&
                 (
                     <div className={classes.voteMain}>
                         <div className={classes.voteHeader}>
                             <div className={classes.voteHeaderText}>
                                 Votes
                             </div>
                             <div className={classes.voteHeaderNum}>
                                 {voteCount}
                             </div>
                         </div>
                         <div >
                             {bipVotes.map(item => (
                                 <div key={item.id}>
                                     <div className={classes.voteContent}>
                                         <div className={classes.voteListChild}>
                                             <AddressAvatar address={item.address} size={20} />
                                             {/*<div className={classes.voteUserAddress}>{item.address} </div>*/}
                                             {/*<div className={classes.voteUserAddress}></div>*/}
                                             <EthAddress address={item.address} className={classes.voteUserAddress}/>
                                             {item.delegateList && item.delegateList.length>0 && (<div className={classes.voteCount} onClick={()=> {
                                                 const index = showChild.indexOf(item.id);
                                                 if (index !== -1) {
                                                     const newShowChild = showChild.filter(employee => {
                                                         // 👇️ remove object that has id equal to 2
                                                         if (employee != item.id) {
                                                             return employee;
                                                         }
                                                     })
                                                     setShowChild(newShowChild);
                                                 } else {
                                                     setShowChild(current => [...current, item.id]);
                                                 }
                                             }}>
                                                 x{item.delegateList.length} Delegation
                                                 {showChild.indexOf(item.id) !== -1 && (
                                                     <svg className={classes.voteSvg} width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                         <path d="M9.875 5.65292L5.5 0.711771C5.44178 0.646018 5.36629 0.59265 5.27951 0.555893C5.19272 0.519136 5.09703 0.5 5 0.5C4.90297 0.5 4.80728 0.519136 4.72049 0.555893C4.63371 0.59265 4.55822 0.646018 4.5 0.711771L0.125001 5.65292C0.0553589 5.73157 0.0129499 5.8251 0.00252628 5.92303C-0.00789833 6.02095 0.0140753 6.1194 0.0659838 6.20734C0.117891 6.29528 0.197684 6.36924 0.296419 6.42093C0.395154 6.47262 0.50893 6.5 0.625 6.5H9.375C9.49107 6.5 9.60485 6.47262 9.70358 6.42093C9.80232 6.36924 9.88211 6.29528 9.93402 6.20734C9.98592 6.1194 10.0079 6.02095 9.99747 5.92303C9.98705 5.8251 9.94464 5.73157 9.875 5.65292Z" fill="#676B6D"/>
                                                     </svg>
                                                 )}
                                                 {showChild.indexOf(item.id) === -1 && (
                                                     <svg className={classes.voteSvg} width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                         <path d="M9.875 1.34708L5.5 6.28823C5.44178 6.35398 5.36629 6.40735 5.27951 6.44411C5.19272 6.48086 5.09703 6.5 5 6.5C4.90297 6.5 4.80728 6.48086 4.72049 6.44411C4.63371 6.40735 4.55822 6.35398 4.5 6.28823L0.125001 1.34708C0.0553589 1.26843 0.0129499 1.1749 0.00252628 1.07697C-0.00789833 0.979049 0.0140753 0.880601 0.0659838 0.79266C0.117891 0.704719 0.197684 0.63076 0.296419 0.57907C0.395154 0.527379 0.50893 0.5 0.625 0.5H9.375C9.49107 0.5 9.60485 0.527379 9.70358 0.57907C9.80232 0.63076 9.88211 0.704719 9.93402 0.79266C9.98592 0.880601 10.0079 0.979049 9.99747 1.07697C9.98705 1.1749 9.94464 1.26843 9.875 1.34708Z" fill="#676B6D"/>
                                                     </svg>
                                                 )}
                                             </div>)}

                                         </div>
                                         <div className={classes.voteTotal}>
                                             {item.weight} BIBLIO
                                             {/*123 BIBLIO*/}
                                         </div>
                                     </div>

                                     {item.delegateList && showChild.indexOf(item.id) !== -1 && item.delegateList.map(child => (
                                         <div key={child.id} className={classes.voteContent2}>
                                             <div className={classes.voteListChild}>
                                                 <AddressAvatar address={child.address} size={20} />
                                                 {/*<div className={classes.voteUserAddress}>{child.address} </div>*/}
                                                 <div className={classes.voteUserAddress}></div>
                                                 <EthAddress address={child.address} />
                                                 {/*<div>X3 vote</div>*/}
                                             </div>
                                             <div className={classes.voteTotal}>
                                                 {child.actualWeight} BIBLIO
                                                 {/*123 BIBLIO*/}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             ))}
                             <div className={classes.seeMore} onClick={() => openPopop()}>
                                 See more
                             </div>

                         </div>

                     </div>
                 )
            }
        </div>
    )

};

export default VoteLists;
