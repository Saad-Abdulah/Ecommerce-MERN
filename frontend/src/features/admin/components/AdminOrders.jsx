import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllOrdersAsync, resetOrderUpdateStatus, selectOrderUpdateStatus, selectOrders, updateOrderByIdAsync } from '../../order/OrderSlice'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Avatar, Button, Chip, Dialog, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from "react-hook-form"
import { toast } from 'react-toastify';
import {noOrdersAnimation} from '../../../assets/index'
import Lottie from 'lottie-react'

export const AdminOrders = () => {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const [editIndex, setEditIndex] = useState(-1)
  const orderUpdateStatus = useSelector(selectOrderUpdateStatus)
  const theme = useTheme()
  const is1620 = useMediaQuery(theme.breakpoints.down(1620))
  const is1200 = useMediaQuery(theme.breakpoints.down(1200))
  const is820 = useMediaQuery(theme.breakpoints.down(820))
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);

  const {register, handleSubmit, formState: { errors }} = useForm()

  useEffect(() => {
    dispatch(getAllOrdersAsync())
  }, [dispatch])

  useEffect(() => {
    if(orderUpdateStatus === 'fulfilled') {
      toast.success("Status updated")
    }
    else if(orderUpdateStatus === 'rejected') {
      toast.error("Error updating order status")
    }
  }, [orderUpdateStatus])

  useEffect(() => {
    return () => {
      dispatch(resetOrderUpdateStatus())
    }
  }, [])

  const handleUpdateOrder = (data) => {
    const update = {...data, _id: orders[editIndex]._id}
    setEditIndex(-1)
    dispatch(updateOrderByIdAsync(update))
  }

  const handleViewAddress = (address) => {
    setSelectedAddress(address);
    setOpenAddressDialog(true);
  };

  const handleCloseAddressDialog = () => {
    setOpenAddressDialog(false);
    setSelectedAddress(null);
  };

  const editOptions = ['Pending', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled']

  const getStatusColor = (status) => {
    if(status === 'Pending') {
      return {bgcolor: '#dfc9f7', color: '#7c59a4'}
    }
    else if(status === 'Dispatched') {
      return {bgcolor: '#feed80', color: '#927b1e'}
    }
    else if(status === 'Out for delivery') {
      return {bgcolor: '#AACCFF', color: '#4793AA'}
    }
    else if(status === 'Delivered') {
      return {bgcolor: "#b3f5ca", color: "#548c6a"}
    }
    else if(status === 'Cancelled') {
      return {bgcolor: "#fac0c0", color: '#cc6d72'}
    }
  }

  return (
    <Stack justifyContent={'center'} alignItems={'center'}>
      <Stack mt={5} mb={3} component={'form'} noValidate onSubmit={handleSubmit(handleUpdateOrder)}>
        {
          orders.length ?
          <TableContainer sx={{width: is1620 ? "95vw" : "auto", overflowX: 'auto'}} component={Paper} elevation={2}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell align="left">Item</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="right">Shipping Address</TableCell>
                  <TableCell align="right">Payment Method</TableCell>
                  <TableCell align="right">Order Date</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {
                orders.length && orders.map((order, index) => (
                  <TableRow key={order._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{index + 1}</TableCell>
                    <TableCell align="left">
                      {
                        order.item.map((product) => (
                          <Stack key={product._id} mt={2} flexDirection={'row'} alignItems={'center'} columnGap={2}>
                            <Stack 
                              sx={{
                                width: '60px',
                                height: '60px',
                                overflow: 'hidden',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <img 
                                src={product.product.thumbnail} 
                                alt={product.product.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Stack>
                            <Stack>
                              <Typography variant="body1">{product.product.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Qty: {product.quantity}
                              </Typography>
                            </Stack>
                          </Stack>
                        ))
                      }
                    </TableCell>
                    <TableCell align="right">${order.total}</TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="text" 
                        onClick={() => handleViewAddress(order.address[0])}
                        sx={{ textTransform: 'none' }}
                      >
                        View Address
                      </Button>
                    </TableCell>
                    <TableCell align="right">{order.paymentMode}</TableCell>
                    <TableCell align="right">{new Date(order.createdAt).toDateString()}</TableCell>

                    <TableCell align="right">
                      {
                        editIndex === index ? (
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Update status</InputLabel>
                            <Select
                              defaultValue={order.status}
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              label="Update status"
                              {...register('status', {required: 'Status is required'})}
                            >
                              {
                                editOptions.map((option) => (
                                  <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))
                              }
                            </Select>
                          </FormControl>
                        ) : <Chip label={order.status} sx={getStatusColor(order.status)}/>
                      }
                    </TableCell>

                    <TableCell align="right">
                      {
                        editIndex === index ? (
                          <Button>
                            <IconButton type='submit'><CheckCircleOutlinedIcon/></IconButton>
                          </Button>
                        )
                        :
                        <IconButton onClick={() => setEditIndex(index)}><EditOutlinedIcon/></IconButton>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          :
          <Stack width={is480 ? "auto" : '30rem'} justifyContent={'center'}>
            <Stack rowGap={'1rem'}>
              <Lottie animationData={noOrdersAnimation}/>
              <Typography textAlign={'center'} alignSelf={'center'} variant='h6' fontWeight={400}>There are no orders currently</Typography>
            </Stack>
          </Stack>  
        }
      </Stack>

      {/* Address Dialog */}
      <Dialog 
        open={openAddressDialog} 
        onClose={handleCloseAddressDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Shipping Address</Typography>
            <IconButton onClick={handleCloseAddressDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedAddress && (
            <Stack spacing={2} mt={1}>
              <Typography variant="body1" fontWeight={500}>
                {selectedAddress.type}
              </Typography>
              <Stack spacing={1}>
                <Typography>{selectedAddress.street}</Typography>
                <Typography>{selectedAddress.city}, {selectedAddress.state}</Typography>
                <Typography>{selectedAddress.country} - {selectedAddress.postalCode}</Typography>
                <Typography>Phone: {selectedAddress.phoneNumber}</Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
