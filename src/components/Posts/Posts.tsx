import { Community } from '@/atoms/communitiesAtom';
import { Post } from '@/atoms/postAtom';
import { auth, firestore } from '@/firebase/clientApp';
import usePosts from '@/hooks/usePosts';
import { Stack } from '@chakra-ui/react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem';

type PostsProps = {
  communityData: Community;
  userId?: string;
};

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  } = usePosts();

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    try {
      const postQuery = query(
        collection(firestore, 'posts'),
        where('communityId', '==', communityData.id),
        orderBy('createdAt', 'desc')
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));
    } catch (error: any) {
      console.log('getPosts error: ', error.message);
    }
  };

  return (
    <Stack>
      {postStateValue.posts.map((item, key) => (
        <PostItem
          key={key}
          post={item}
          userIsCreator={user?.uid === item.creatorId}
          userVoteValue={
            postStateValue.postVotes.find((vote) => vote.postId === item.id)
              ?.voteValue
          }
          onVote={onVote}
          onSelectPost={onSelectPost}
          onDeletePost={onDeletePost}
        />
      ))}
    </Stack>
  );
};
export default Posts;
