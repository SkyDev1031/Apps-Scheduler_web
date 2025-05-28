import {
    Autocomplete, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, IconButton, InputAdornment,
    InputLabel, OutlinedInput, TextField, FormControlLabel
} from '@mui/material';
import { Button, DataTable, InputMask, InputSwitch, InputText } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUserApi, getClientsApi, sendTextApi, updateUserApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from "../../contexts";
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    TEXT: 2,
    PURCHASES: 3,
    WALLETS: 4,
    DELETE: 5,
    NETWORK: 6
}

const Clients = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState([])
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();
    const [showPassword, setShowPassword] = useState(false)
    const [editablePassword, setEditablePassword] = useState(false)

    const [showSecondaryPassword, setShowSecondaryPassword] = useState(false)
    const [editableSecPassword, setEditableSecPassword] = useState(false)

    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    })
    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD;
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;
    const _isText = selectedItem.type == _ACT_TYPE.TEXT;
    const _label = _isAdd ? 'Add New client' : _isEdit ? 'Edit client' : _isText ? 'Send Text' : 'Dialog';

    useEffect(() => {
        getClients();
    }, [])
    const getClients = () => {
        setLoading(true);
        getClientsApi()
            .then(res => setClients(res.data))
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }

    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleClose = () => {
        initSelection();
    };
    const handleAction = async () => {
        if (_isAdd || _isEdit) {
            if (!_data.fullname) return toast_error('Please enter your Name', _ERROR_CODES.INVALID_INPUT);
            if (!_data.ScreenName) return toast_error('Please enter your Screen Name', _ERROR_CODES.INVALID_INPUT);
            if (!_data.username) return toast_error('Please enter your Email', _ERROR_CODES.INVALID_INPUT);
            // if (!_data.phone) return toast_error('Please enter your Phone', _ERROR_CODES.INVALID_INPUT);
            if (!_data.sponsor) return toast_error('Please enter your Sponsor', _ERROR_CODES.INVALID_INPUT);
            if ((_isEdit && editablePassword || _isAdd) && !_data.password)
                return toast_error('Please enter your password', _ERROR_CODES.INVALID_INPUT);
            if ((_isEdit && editableSecPassword || _isAdd) && !_data.secondary_password)
                return toast_error('Please enter your password', _ERROR_CODES.INVALID_INPUT);
            setLoading(true);
            if (_isEdit) {
                if (!editablePassword) delete _data.password;
                if (!editableSecPassword) delete _data.secondary_password;
            }
            var res = await updateUserApi(_data).catch(err => toast_error(err, _ERROR_CODES.UPDATE_USER_ERROR))
            if (res?.success) {
                toast_success(res?.message);
                initSelection();
                getClients();
            } else {
                setLoading(false);
            }
        } else if (_isText) {
            const message = selectedItem.message;
            if (!message) return toast_error('Please enter the message to send user', _ERROR_CODES.INVALID_INPUT);
            setLoading(true);
            var res = await sendTextApi({ message, id: _data.id }).catch(err => toast_error(err, _ERROR_CODES.SEND_TEXT_ERROR))
            if (res?.success) {
                toast_success(res?.message);
                initSelection();
            }
            setLoading(false);
        }
    }
    const OnActions = async (data, type) => {
        if (type === _ACT_TYPE.PURCHASES) navigate(`/admin/packages/purchase/${data.id}`);
        else if (type === _ACT_TYPE.WALLETS) navigate(`/admin/wallet/${data.id}`);
        else if (type === _ACT_TYPE.NETWORK) navigate(`/admin/network/${data.id}`);
        else if (type === _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            const res = await deleteUserApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message)
                getClients();
            }
        } else {
            initSelection({ data, visible: true, type });
        }
    }
    return (
        <>
            <DataTable value={clients} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add New Client' onClick={() => OnActions({ id: 0 }, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'fullname'} header={'Client Name'} field={'fullname'} sortable />
                <Column key={'screenname'} header={'Screen Name'} field={'ScreenName'} sortable />
                <Column key={'sponsor'} header={'Sponsor'} field={'sponsor'} sortable />
                <Column key={'rank'} header={'Rank'} field={'rank'} sortable
                    body={(rowData) => (
                        <div style={{ maxWidth: 100 }}>
                            Rank:{rowData.rank} L:{rowData.left}<br />R:{rowData.right} DR:{rowData.direct_referral}
                        </div>
                    )} />
                <Column key={'LoginIP'} header={'Last Login IP'} field={'LoginIP'} sortable
                    body={rowData => rowData.LoginIP?.split(" ")[0]} />
                <Column key={'LoginStatus'} header={'Just Login'} field={'LoginStatus'} sortable
                    body={(rowData) => (
                        rowData.LoginStatus == 0 ?
                            <a type="button" className="error-text" >&Chi;</a>
                            :
                            <a type="button" className="success-text">&radic;</a>
                    )} />
                <Column key={'status'} header={'Status'} field={'status'} sortable />
                <Column key={'support'} header={'Is Moderator'} field={'support'} sortable
                    body={(rowData) => (
                        rowData.support == 0 ?
                            <a type="button" className="error-text" >&Chi;</a>
                            :
                            <a type="button" className="success-text">&radic;</a>
                    )} />
                <Column key={'id'} header={''} field={'id'} sortable
                    body={(data) => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => OnActions(data, _ACT_TYPE.EDIT)} />
                            <Button label="Text" className="p-button-rounded p-button-warning m-1" onClick={() => OnActions(data, _ACT_TYPE.TEXT)} />
                            <Button label="Wallets" className="p-button-rounded p-button-success m-1" onClick={() => OnActions(data, _ACT_TYPE.WALLETS)} />
                            {data.role != 1 && <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => OnActions(data, _ACT_TYPE.DELETE)} />}
                            <br />
                            <Button label="Network Balance" className="p-button-rounded p-button-help m-1" onClick={() => OnActions(data, _ACT_TYPE.NETWORK)} />
                            <Button label="Purchases" className="p-button-rounded p-button-info m-1" onClick={() => OnActions(data, _ACT_TYPE.PURCHASES)} />

                        </div>
                    )} />
            </DataTable>

            <Dialog
                open={selectedItem.visible || false}
                scroll={'paper'} maxWidth={'md'} fullWidth
                aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description"
                onClose={handleClose}
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>{_label}</DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <form>
                        <input id="email" className='hide' type="email" name="fakeemailremembered" autoComplete="off" />
                        <input id="username" className='hide' type="text" name="fakeusernameremembered" autoComplete="off" />
                        <input id="password" className='hide' type="password" name="fakepasswordremembered" autoComplete="off" />

                        {(_isAdd || _isEdit) &&
                            <>
                                <FormControl fullWidth className="mb-4">
                                    <TextField id="outlined-basic" label="Name" required variant="outlined" placeholder='Name'
                                        value={_data.fullname || ''}
                                        onChange={e => updateSelectionData({ fullname: e.target.value })} />
                                </FormControl>
                                <FormControl fullWidth className="mb-4">
                                    <TextField id="outlined-basic" label="Screen Name" required variant="outlined" placeholder='Screen Name'
                                        value={_data.ScreenName || ''}
                                        onChange={e => updateSelectionData({ ScreenName: e.target.value })} />
                                </FormControl>
                                <FormControl fullWidth className="mb-4">
                                    <TextField id="outlined-basic" label="Email" required variant="outlined" placeholder='Email address'
                                        type={'email'}
                                        value={_data.username || ''}
                                        onChange={e => updateSelectionData({ username: e.target.value })} />
                                </FormControl>
                                <FormControl fullWidth className="mb-4">
                                    <InputMask
                                        id="phone"
                                        mask="(999) 999-9999" placeholder="(999) 999-9999" value={_data.phone || ''}
                                        onChange={(e) => _data.phone = e.target.value?.replace(/\D/g, '')} />
                                </FormControl>
                                <FormControl fullWidth className="mb-5">
                                    <Autocomplete
                                        disablePortal
                                        options={(clients || []).map(item => item.ScreenName)}
                                        value={_data.sponsor || ''}
                                        onChange={(e, sponsor) => updateSelectionData({ sponsor })}
                                        renderInput={(params) => <TextField {...params} label="Sponsor" autoComplete='sponsor-name' />}
                                    />
                                </FormControl>
                                <FormControl fullWidth variant="outlined" className='mb-4'>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <OutlinedInput
                                        id="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={_data.password || ''}
                                        onChange={e => updateSelectionData({ password: e.target.value })}
                                        disabled={_isEdit && !editablePassword}
                                        startAdornment={
                                            _isEdit ?
                                                <InputAdornment position="start">
                                                    <InputSwitch checked={editablePassword} onChange={(e) => {
                                                        setEditablePassword(e.value);
                                                        updateSelectionData({ password: '' })
                                                    }} />
                                                </InputAdornment>
                                                :
                                                null
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
                                        disabled={_isEdit && !editableSecPassword}
                                        type={showSecondaryPassword ? 'text' : 'password'}
                                        value={_data.secondary_password || ''}
                                        onChange={e => updateSelectionData({ secondary_password: e.target.value })}
                                        startAdornment={
                                            _isEdit ?
                                                <InputAdornment position="start">
                                                    <InputSwitch checked={editableSecPassword} onChange={(e) => {
                                                        setEditableSecPassword(e.value)
                                                        updateSelectionData({ secondary_password: '' })
                                                    }} />
                                                </InputAdornment>
                                                :
                                                null
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton edge="end" onClick={() => setShowSecondaryPassword(p => !p)}>
                                                    {showSecondaryPassword ? <i className='pi pi-eye-slash' /> : <i className='pi pi-eye' />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </FormControl>
                                <FormControl fullWidth className="p-2">
                                    <FormControlLabel
                                        control={
                                            <InputSwitch
                                                className='m-2'
                                                checked={_data.support == '1'}
                                                onChange={e => updateSelectionData({ support: e.target.value ? '1' : '0' })}
                                            />
                                        }
                                        label="Support"
                                    />
                                </FormControl>
                            </>
                        }
                        {_isText &&
                            <>
                                <FormControl fullWidth variant="outlined" className="mb-4">
                                    <TextField id="standard-multiline-flexible"
                                        label="Message" required maxRows={1}
                                        multiline variant="outlined"
                                        defaultValue={selectedItem.message}
                                        onChange={e => selectedItem.message = e.target.value} />
                                </FormControl>
                            </>
                        }
                    </form>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Clients;