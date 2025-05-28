import {
    FormControl, IconButton, InputAdornment,
    InputLabel, OutlinedInput, TextField, Unstable_Grid2 as Grid
} from '@mui/material';
import { Button, InputSwitch } from 'primereact';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { getAdminApi, updateAdminApi } from '../../api/OriginAPI.js';
import { toolbarOptions, _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success, validateEmail } from '../../utils';


const Settings = () => {
    const [adminData, setAdminData] = useState({})
    const { user, setLoading, refreshUser } = useGlobalContext();
    const [username, setUsername] = useState(user.username)

    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [editablePassword, setEditablePassword] = useState(false)

    const [secondaryPassword, setSecondaryPassword] = useState('')
    const [show2ndPassword, setShow2ndPassword] = useState(false)
    const [editable2ndPassword, setEditable2ndPassword] = useState(false)

    const updateAdminData = (item) => setAdminData(prev => ({ ...prev, ...item }))

    useEffect(() => {
        getAdmin();
    }, [])

    const getAdmin = async () => {
        setLoading(true);
        const res = await getAdminApi()
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            setAdminData(res.data);
            setLoading(false)
        }
    }
    const handleClose = () => {
        initSelection();
    };
    const handleAction = async () => {
        if (!username) return toast_error("Please enter the email address", _ERROR_CODES.INVALID_INPUT);
        if (!validateEmail(username)) return toast_error("Please enter the valid email address", _ERROR_CODES.INVALID_INPUT);
        if (editablePassword && !password) return toast_error("Please enter your password or disable password editing with the switch.", _ERROR_CODES.INVALID_INPUT);
        if (editable2ndPassword && !secondaryPassword) return toast_error("Please enter your secondary password or disable secondary password editing with the switch.", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.binaryExpireDays >= 0)) return toast_error("Please enter correct unpaid payments expire days", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.TransferFeeTransferDelay >= 0)) return toast_error("Please enter correct transfer fee delay in minutes.", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.ReferralLinkGeneratorFee >= 0)) return toast_error("Please enter correct referral link generator fee", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.PackageTransferFee >= 0)) return toast_error("Please enter correct package transfer fee", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.BuyersFee >= 0)) return toast_error("Please enter correct buyers fee", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.FeatureItemFee >= 0)) return toast_error("Please enter correct feature item fee", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.stakePro >= 0)) return toast_error("Please enter correct stake percentage value", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.networkPro >= 0)) return toast_error("Please enter correct network percentage value", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.amountPerAns >= 0)) return toast_error("Please enter correct per answer amount value", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.amountToModer >= 0)) return toast_error("Please enter correct moderator amount value", _ERROR_CODES.INVALID_INPUT);
        if (!(adminData.amountToNet >= 0)) return toast_error("Please enter correct network amount value", _ERROR_CODES.INVALID_INPUT);
        if (!adminData.about_us) return toast_error("Please put the about us field", _ERROR_CODES.INVALID_INPUT);
        if (!adminData.featured_video) return toast_error("Please put the feature video", _ERROR_CODES.INVALID_INPUT);
        if (!adminData.terms_and_conditions) return toast_error("Please put the Terms & Conditions", _ERROR_CODES.INVALID_INPUT);

        const tmp_data = {
            username,
            editablePassword,
            editable2ndPassword,
            password,
            secondaryPassword,
            adminData
        };
        const res = await updateAdminApi(tmp_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res.message);
            getAdmin();
            refreshUser()
        }
    }
    return (
        <Grid container spacing={3} className={'p-20'}>
            <Grid xs={12} md={6} className={'pt-20'}>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Email" required variant="outlined" placeholder='Email address'
                        type={'email'}
                        value={username || ''}
                        onChange={e => setUsername(e.target.value)} />
                </FormControl>
                <FormControl fullWidth variant="outlined" className='mb-4'>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                        id="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password || ''}
                        onChange={e => setPassword(e.target.value)}
                        disabled={!editablePassword}
                        startAdornment={
                            <InputAdornment position="start">
                                <InputSwitch checked={editablePassword} onChange={(e) => {
                                    setEditablePassword(e.value);
                                    setPassword('')
                                }} />
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton edge="end" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <i className='pi pi-eye-slash' /> : <i className='pi pi-eye' />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl fullWidth variant="outlined" className="mb-4">
                    <InputLabel htmlFor="secondary_password">Secondary Password</InputLabel>
                    <OutlinedInput
                        id="secondary_password"
                        label={'Secondary Password'}
                        disabled={!editable2ndPassword}
                        type={show2ndPassword ? 'text' : 'password'}
                        value={secondaryPassword || ''}
                        onChange={e => setSecondaryPassword(e.target.value)}
                        startAdornment={
                            <InputAdornment position="start">
                                <InputSwitch checked={editable2ndPassword} onChange={(e) => {
                                    setEditable2ndPassword(e.value)
                                    setSecondaryPassword('')
                                }} />
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton edge="end" onClick={() => setShow2ndPassword(p => !p)}>
                                    {show2ndPassword ? <i className='pi pi-eye-slash' /> : <i className='pi pi-eye' />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Unpaid payments expire(days)" required variant="outlined" placeholder='Unpaid payments expire'
                        value={`${adminData.binaryExpireDays}`}
                        type={'number'}
                        onChange={e => updateAdminData({ binaryExpireDays: e.target.value })} />
                </FormControl>

                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Transfer Fee Standard Delay [Minutes]" required variant="outlined"
                        placeholder='Transfer Fee Standard Delay [Minutes]'
                        type={'number'}
                        value={`${adminData.TransferFeeTransferDelay}`}
                        onChange={e => updateAdminData({ TransferFeeTransferDelay: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Referral Link Generator Fee" required variant="outlined" placeholder='Referral Link Generator Fee'
                        type={'number'}
                        value={`${adminData.ReferralLinkGeneratorFee}`}
                        onChange={e => updateAdminData({ ReferralLinkGeneratorFee: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Package Transfer Fee %" required variant="outlined" placeholder='Package Transfer Fee %'
                        type={'number'}
                        value={`${adminData.PackageTransferFee}`}
                        onChange={e => updateAdminData({ PackageTransferFee: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Buyers Fee %" required variant="outlined" placeholder='Buyers Fee %'
                        type={'number'}
                        value={`${adminData.BuyersFee}`}
                        onChange={e => updateAdminData({ BuyersFee: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Feature Item Fee %" required variant="outlined" placeholder='Feature Item Fee %'
                        type={'number'}
                        value={`${adminData.FeatureItemFee}`}
                        onChange={e => updateAdminData({ FeatureItemFee: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Swap Stake %" required variant="outlined"
                        placeholder='Swap Stake %'
                        type={'number'}
                        value={`${adminData.stakePro}`}
                        onChange={e => updateAdminData({ stakePro: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Swap fee % going to network" required variant="outlined" placeholder='Swap fee % going to network'
                        type={'number'}
                        value={`${adminData.networkPro}`}
                        onChange={e => updateAdminData({ networkPro: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Credits amount per answer for support(BUSD)" required variant="outlined" placeholder='Credits amount per answer for support'
                        type={'number'}
                        value={`${adminData.amountPerAns}`}
                        onChange={e => updateAdminData({ amountPerAns: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Credits amount going to moderator(BUSD)" required variant="outlined" placeholder='Credits amount going to moderator'
                        type={'number'}
                        value={`${adminData.amountToModer}`}
                        onChange={e => updateAdminData({ amountToModer: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Credits amount going to network(BUSD)" required variant="outlined" placeholder='Credits amount going to network'
                        type={'number'}
                        value={`${adminData.amountToNet}`}
                        onChange={e => updateAdminData({ amountToNet: e.target.value })} />
                </FormControl>
            </Grid>
            <Grid xs={12} md={6} className={'pt-20'}>
                <InputLabel>{'About Us'}</InputLabel>
                <FormControl fullWidth className="description-input">
                    <ReactQuill
                        id="about-us"
                        theme="snow"
                        modules={{ toolbar: toolbarOptions }} style={{ height: 200 }}

                        value={adminData.about_us || ''}
                        onChange={about_us => updateAdminData({ about_us })} />
                </FormControl>
                <InputLabel>{'Feature Video'}</InputLabel>
                <FormControl fullWidth variant="outlined" className="mb-4">
                    <TextField id="feature-video"
                        required maxRows={1}
                        multiline variant="outlined"
                        defaultValue={adminData.featured_video}
                        onChange={e => updateAdminData({ featured_video: e.target.value })} />
                </FormControl>
                <InputLabel>{'Terms & Conditions'}</InputLabel>
                <FormControl fullWidth className="description-input">
                    <ReactQuill
                        id="terms"
                        theme="snow"
                        modules={{ toolbar: toolbarOptions }} style={{ height: 200 }}

                        value={adminData.terms_and_conditions || ''}
                        onChange={terms_and_conditions => updateAdminData({ terms_and_conditions })} />
                </FormControl>
                <FormControl fullWidth className="mb-4 mt-4">
                    <TextField id="outlined-basic" label="Website Facebook Full Url" required variant="outlined" placeholder='Website Facebook Full Url'
                        value={adminData.facebook_url || ''}
                        onChange={e => updateAdminData({ facebook_url: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Website Twitter Full Url" required variant="outlined" placeholder='Website Twitter Full Url'
                        value={adminData.twitter_url || ''}
                        onChange={e => updateAdminData({ twitter_url: e.target.value })} />
                </FormControl>
                <FormControl fullWidth className="mb-4">
                    <TextField id="outlined-basic" label="Website Instagram Full Url" required variant="outlined" placeholder='Website Instagram Full Url'
                        value={adminData.instagram_url || ''}
                        onChange={e => updateAdminData({ instagram_url: e.target.value })} />
                </FormControl>
            </Grid>
            <Button className='p-button-success m-2' onClick={handleAction}>{'Confirm'}</Button>
            <Button className='p-button-danger m-2' onClick={handleClose}>Cancel</Button>
        </Grid>
    )
}
export default Settings;