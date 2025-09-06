import UserAvatar from '@/components/user-avatar';
import { CameraPlusIcon } from '@/icons';
import { useUploadThing } from '@/lib/uploadthing';
import { DateToString } from '@/types/helper';
import { useDropzone } from '@uploadthing/react';
import { User } from 'next-auth';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from 'uploadthing/client';
import { useEditUserProfilePic } from '../_api/use-edit-user-profile-pic';

const EditProfilePic = ({
  user,
  onUpdate,
}: {
  user: DateToString<User>;
  onUpdate?: (imageUrl: string) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const { mutate, isPending } = useEditUserProfilePic();

  const { startUpload, routeConfig } = useUploadThing('imageUploader', {
    onUploadError: () => {
      toast.error('Image upload failed!');
      setIsUploading(false);
    },
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        toast.success('Profile picture updated!');
        mutate({
          image: res[0].url,
        });
      }
      setIsUploading(false);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      try {
        setIsUploading(true);
        await startUpload([file]);
      } catch (error) {
        toast.error('Failed to update profile picture');
        setIsUploading(false);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024, // 4MB max size
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer transition-opacity ${isUploading || isPending ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input {...getInputProps()} />
      <UserAvatar
        className='border-2 border-tertiary size-36'
        src={user.image}
        name={user.name}
      />
      <div className='absolute right-1 bottom-3'>
        <div className='flex items-center justify-center p-1.5 bg-tertiary text-tertiary-foreground rounded-full hover:bg-tertiary/90 transition-colors'>
          <CameraPlusIcon className='size-4' />
        </div>
      </div>
      {isDragActive && (
        <div className='absolute inset-0 bg-tertiary/20 rounded-full flex items-center justify-center'>
          <p className='text-sm text-tertiary-foreground'>Drop image here</p>
        </div>
      )}
      {isUploading && (
        <div className='absolute inset-0 bg-tertiary/20 rounded-full flex items-center justify-center'>
          <p className='text-sm text-tertiary-foreground'>Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default EditProfilePic;
