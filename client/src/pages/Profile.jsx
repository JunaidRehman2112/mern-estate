import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector} from 'react-redux';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import {app} from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailed } from '../redux/user/userSlice';
import { deleteUserStart, deleteUserSuccess, deleteUserFailed,  signOutUserStart, signOutUserSuccess, signOutUserFailed} from '../redux/user/userSlice';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user)
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

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
  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false) {
        dispatch(updateUserFailed(data.message));
        return;
      }

      dispatch(updateUserSuccess(data))
      setUpdateSuccess(true)
    } catch (error) {
      dispatch(updateUserFailed(error.message))
    }
  }
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success === false) {
        dispatch(deleteUserFailed(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data))
    } catch (error) {
      dispatch(deleteUserFailed(error.message))
    }
  }
  const handleSignout = async () => {
    dispatch(signOutUserStart());
    try {
      const res = await fetch(`/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailed(data.message));
        return
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailed(error.message))
    }
  }
  return (
    <div className='max-w-lg p-3 mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
        defaultValue={currentUser.username}
        onChange={handleChange}
        className='border p-3 rounded-lg'/>
    
        <input type='email' id='email' 
        placeholder='email'
        onChange={handleChange}
        defaultValue={currentUser.email}
        className='border p-3 rounded-lg'/>

        <input type='password' id='password' 
        placeholder='password'
        onChange={handleChange}
        className='border p-3 rounded-lg'/>
      
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95
        disabled:opacity-80'>
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link to={'/create-listing'} 
        className='bg-green-700 text-white rounded-lg p-3 uppercase text-center hover:opacity-95
        disabled:opacity-80'>
          Create Listing
        </Link>
      </form>
      
      <div className='flex justify-between mt-5'>
        <span 
        onClick={handleDeleteUser}
        className='text-red-700 cursor-pointer'>
          Delete account
        </span>
        <span 
        onClick={handleSignout}
        className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
      <p className='text-red-700 mt-5'>{error}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User updated successfully' : ''}</p>
    </div>
  )
}
