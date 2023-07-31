import React from 'react';
import { useParams } from 'react-router-dom';
import Comments from '../../components/Comments';

const CommentsPage = () => {
  const params = useParams();
  const { proposalId } = params;

  if (proposalId) {
    return (<Comments proposalId={Number(proposalId)} />);
  } else {
    return (<div>Undefined proposalId</div>);
  }
};

export default CommentsPage;