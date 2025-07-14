import { Avatar, Button, Paper, Stack, Typography, useTheme, TextField, useMediaQuery, IconButton } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice'
import { useForm } from "react-hook-form"
import { Address } from '../../address/components/Address'
import { toast } from 'react-toastify'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { updateUserByIdAsync } from '../UserSlice'
import AddIcon from '@mui/icons-material/Add';

export const UserProfile = () => {
    const loggedInUser = useSelector(selectLoggedInUser)
    const addresses = useSelector(selectAddresses)
    const status = useSelector(selectAddressStatus)
    const dispatch = useDispatch()
    const theme = useTheme()
    const fileInputRef = useRef(null)
    const is500 = useMediaQuery(theme.breakpoints.down(500))
    const [showAddressForm, setShowAddressForm] = useState(false)
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    useEffect(() => {
        if (status === 'fulfilled') {
            reset()
            toast.success("Address added successfully")
        }
        else if (status === 'rejected') {
            toast.error("Error adding address")
        }
    }, [status])

    const handleAddAddress = (data) => {
        const address = { ...data, user: loggedInUser._id }
        dispatch(addAddressAsync(address))
        setShowAddressForm(false)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        const formData = new FormData()
        formData.append('profileImage', file)
        formData.append('_id', loggedInUser._id)

        try {
            await dispatch(updateUserByIdAsync(formData))
            toast.success('Profile image updated successfully')
        } catch (error) {
            toast.error('Error updating profile image')
        }
    }

    return (
        <Stack p={2} mb={'5rem'} rowGap={4}>

            {/* profile section */}
            <Stack component={Paper} elevation={1} p={2}>
                <Stack flexDirection={'row'} alignItems={'center'} columnGap={2}>
                    <Stack position="relative">
                        <Avatar 
                            src={loggedInUser?.profileImage ? `/profileImages/${loggedInUser.profileImage}` : null}
                            alt={loggedInUser?.name} 
                            sx={{ width: 56, height: 56 }}
                        />
                        <IconButton 
                            size="small"
                            sx={{
                                position: 'absolute',
                                bottom: -8,
                                right: -8,
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PhotoCameraIcon fontSize="small" />
                        </IconButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Stack>
                    <Stack>
                        <Typography variant='h6'>{loggedInUser?.name}</Typography>
                        <Typography color={'text.secondary'}>{loggedInUser?.email}</Typography>
                        {loggedInUser?.isAdmin && (
                            <Typography color={'primary'} sx={{mt: 1}}>Administrator</Typography>
                        )}
                    </Stack>
                </Stack>
            </Stack>

            {/* addresses section - only show for non-admin users */}
            {!loggedInUser?.isAdmin && (
                <Stack rowGap={2}>
                    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Typography variant='h5'>Addresses</Typography>
                        <Button 
                            startIcon={<AddIcon />} 
                            variant="contained" 
                            onClick={() => setShowAddressForm(!showAddressForm)}
                        >
                            {showAddressForm ? 'Cancel' : 'Add New Address'}
                        </Button>
                    </Stack>
                    <Stack rowGap={2}>
                        {
                            addresses.map((address) => (
                                <Address key={address._id} id={address._id} type={address.type} street={address.street} postalCode={address.postalCode} country={address.country} phoneNumber={address.phoneNumber} state={address.state} city={address.city} />
                            ))
                        }
                    </Stack>
                </Stack>
            )}

            {/* add new address form - shown conditionally for non-admin users */}
            {!loggedInUser?.isAdmin && showAddressForm && (
                <Stack component={'form'} noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
                    <Typography variant='h6'>Add New Address</Typography>

                    <Stack>
                        <Typography gutterBottom>Type</Typography>
                        <TextField placeholder='Eg. Home, Business' {...register("type", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Street</Typography>
                        <TextField {...register("street", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Country</Typography>
                        <TextField {...register("country", { required: true })} />
                    </Stack>

                    <Stack>
                        <Typography gutterBottom>Phone Number</Typography>
                        <TextField type='number' {...register("phoneNumber", { required: true })} />
                    </Stack>

                    <Stack flexDirection={'row'}>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>City</Typography>
                            <TextField {...register("city", { required: true })} />
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>State</Typography>
                            <TextField {...register("state", { required: true })} />
                        </Stack>
                        <Stack width={'100%'}>
                            <Typography gutterBottom>Postal Code</Typography>
                            <TextField type='number' {...register("postalCode", { required: true })} />
                        </Stack>
                    </Stack>

                    <Button type='submit' variant='contained' sx={{ alignSelf: 'flex-start' }}>Add Address</Button>
                </Stack>
            )}
        </Stack>
    )
}
