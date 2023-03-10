import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  CloseButton,
  Flex,
  Icon,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { BiPoll } from 'react-icons/bi';
import { BsLink45Deg, BsMic } from 'react-icons/bs';
import { IoDocumentText, IoImageOutline } from 'react-icons/io5';
import { AiFillCloseCircle } from 'react-icons/ai';
import TabItem from './TabItem';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '@/atoms/postAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { firestore, storage } from '@/firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import useSelectFile from '@/hooks/useSelectFile';

type NewPostFormProps = {
  user: User;
};

const formTabs: TabItemType[] = [
  {
    title: 'Post',
    icon: IoDocumentText,
  },
  {
    title: 'Images & Videos',
    icon: IoImageOutline,
  },
  {
    title: 'Link',
    icon: BsLink45Deg,
  },
  {
    title: 'Poll',
    icon: BiPoll,
  },
  {
    title: 'Talk',
    icon: BsMic,
  },
];

export type TabItemType = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
  const [textInputs, setTextInputs] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
  const router = useRouter();

  const handleCreatePost = async () => {
    const { communityId } = router.query;

    const newPost: Post = {
      communityId: communityId as string,
      creatorId: user?.uid,
      creatorDisplayName: user.email!.split('@')[0],
      title: textInputs.title,
      body: textInputs.body,
      numberOfComments: 0,
      voteStatus: 0,
      createdAt: serverTimestamp() as Timestamp,
    };
    setLoading(true);
    try {
      const postDocRef = await addDoc(collection(firestore, 'posts'), newPost);

      if (selectedFile) {
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
        await uploadString(imageRef, selectedFile, 'data_url');

        const downloadUrl = await getDownloadURL(imageRef);

        await updateDoc(postDocRef, {
          imageUrl: downloadUrl,
        });
      }
      router.back();
    } catch (error: any) {
      console.log('handleCreatePost error:', error.message);
      setError(true);
    }
    setLoading(false);
  };

  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Flex direction='column' bg='white' borderRadius={4} mt={2}>
      <Flex width='100%'>
        {formTabs.map((item, key) => (
          <TabItem
            item={item}
            key={key}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === 'Post' && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === 'Images & Videos' && (
          <ImageUpload
            onSelectImage={onSelectFile}
            selectedFile={selectedFile}
            setSelectedTabs={setSelectedTab}
            setSelectedFile={setSelectedFile}
          />
        )}
      </Flex>
      {error && (
        <Alert status='error'>
          <AlertIcon />
          <Text mr={2}>Error creating post.</Text>
        </Alert>
      )}
    </Flex>
  );
};
export default NewPostForm;
