import React, { useEffect, useState } from 'react'
import { useSelector} from 'react-redux';
import { useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import {app} from '../firebase'

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user)
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  console.log("currentUser", currentUser);
  useEffect(() => {
    if(file){
      handleFileUpload(file)
    }
  },[file])
  const handleFileUpload = (file) => {
    const Storage = getStorage(app);
    const fileName = new Date().getTime() + file.name; 
    const StorageRef = ref(Storage, fileName);
    const uploadTask = uploadBytesResumable(StorageRef, file);
 
    uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / 
      snapshot.totalBytes) * 100;
      setFilePercentage(Math.round(progress))
    },
    (error) => {
      setFileUploadError(true);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then
      ((downlaodURL) => {
        setFormData({ ...formData, avatar: downlaodURL})
      })
    })
 
  }
  return (
    <div className='max-w-lg p-3 mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input 
        onChange={(e) => setFile(e.target.files[0])}
        type="file" 
        ref={fileRef} 
        hidden
        accept='image/*'/>
        <img 
        src={formData.avatar || currentUser.avatar} 
        onClick={() => fileRef.current.click()}
        alt='profile image'
        className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>
        <p className='text-sm self-center'> 
          {fileUploadError ? (
          <span className='text-red-700'>
            Error Image Upload (image must be less than 2 mb)
          </span> ) : 
          filePercentage > 0 && filePercentage < 100 ? (
            <span className='text-slate-700'>
              {`Uploading ${filePercentage}%`}
            </span>
          ) :
          filePercentage === 100 ? (
            <span className='text-green-700'>
              Successfully uploaded!
            </span>
          ) : (''
          )}
        </p>
        <input type='text'  id='username'
        placeholder='username'
        className='border p-3 rounded-lg'/>
    
    <input type='email' id='email' placeholder='email'
    className='border p-3 rounded-lg'/>

        <input type='password' id='password' placeholder='password'
        className='border p-3 rounded-lg'/>
      
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95
        disabled:opacity-80'>
          update
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>
          Delete account
        </span>
        <span className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
    </div>
  )
}
