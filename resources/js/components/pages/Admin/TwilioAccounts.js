import {
    Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, FormControlLabel, TextField
} from '@mui/material';
import { Button, Column, DataTable, InputSwitch, InputText, Splitter, SplitterPanel, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { deleteNumberApi, getTwilioAccountsApi, updateNumberApi, updateTwilioApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';


const _ACT_TYPE = {
    DEFAULT: -1,
    SAVE_ACCOUNT: 0,
    UNDO_ACCOUNT: 1,
    ADD_NUMBER: 2,
    UPDATE_NUMBER: 3,
    DELETE_NUMBER: 4,
}
const TwilioAccounts = () => {
    const [query, setQuery] = useState('')
    const [account, setAccount] = useState({})
    const [fromNumbers, setFromNumbers] = useState([])
    const { setLoading, confirmDialog } = useGlobalContext();
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    });
    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD_NUMBER;
    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    useEffect(() => {
        getData();
    }, [])

    const getData = () => {
        setLoading(true)
        getTwilioAccountsApi()
            .then(res => {
                setAccount(res.account);
                setFromNumbers(res.numbers);
            })
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const onAction = async (type, data = {}) => {
        if (type == _ACT_TYPE.SAVE_ACCOUNT) {
            if (!account.sid) return toast_error('Please put correct twilio SID', _ERROR_CODES.INVALID_INPUT);
            if (!account.token) return toast_error('Please put correct twilio token', _ERROR_CODES.INVALID_INPUT);
            setLoading(true);
            const res = await updateTwilioApi(account)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message)
            }
            setLoading(false);
        } else if (type == _ACT_TYPE.UNDO_ACCOUNT) {
            getData();
        } else if (type == _ACT_TYPE.DELETE_NUMBER) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            setLoading(true)
            const res = await deleteNumberApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message)
                getData();
            }
        } else {
            initSelection({ visible: true, type, data })
        }
    }
    const handleClose = () => {
        initSelection();
    };
    const handleAction = async () => {
        if (!_data.sid) return toast_error('Please put correct SID', _ERROR_CODES.INVALID_INPUT);
        if (!_data.fromnumber) return toast_error('Please put correct number', _ERROR_CODES.INVALID_INPUT);

        setLoading(true);
        const res = await updateNumberApi({ status: 'Inactive', ..._data })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
        if (res?.success) {
            toast_success(res?.message);
            handleClose();
            getData();
        }
    }
    return (
        <>
            <Splitter container={"true"} spacing={2}>
                <SplitterPanel size={40} className="p-20">
                    <h4>Twilio Account</h4>
                    <hr />
                    <div className="field">
                        <label htmlFor="SID" className="block">SID</label>
                        <InputText id="SID" aria-describedby="SID-help" className="block"
                            value={account.sid || ''}
                            onChange={e => setAccount(prev => ({ ...prev, sid: e.target.value }))} />
                        <small id="SID-help" className="block">Your twilio account SID.</small>
                    </div>
                    <div className="field mt-2">
                        <label htmlFor="TOKEN" className="block">TOKEN</label>
                        <InputText id="TOKEN" aria-describedby="TOKEN-help" className="block"
                            value={account.token || ''}
                            onChange={e => setAccount(prev => ({ ...prev, token: e.target.value }))} />
                        <small id="TOKEN-help" className="block">Your twilio account TOKEN.</small>
                    </div>
                    <Button label="Save" className="p-button-success m-4" onClick={() => onAction(_ACT_TYPE.SAVE_ACCOUNT)} />
                    <Button label="Cancel" className="p-button-danger m-4" onClick={() => onAction(_ACT_TYPE.UNDO_ACCOUNT)} />
                </SplitterPanel>
                <SplitterPanel size={60}>
                    <DataTable value={fromNumbers} responsiveLayout="scroll" stripedRows paginator resizableColumns columnResizeMode="fit" showGridlines
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                        filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                        header={() => (
                            <div className="justify-content-between d-flex">
                                <h4 className='table-title'>Twilio Numbers</h4>
                                <Button label='New Number' onClick={() => onAction(_ACT_TYPE.ADD_NUMBER)} />
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                                </span>
                            </div>
                        )}
                    >
                        <Column key={'fromnumber'} header={'NUMBER'} field={'fromnumber'} sortable />
                        <Column key={'sid'} header={'SID'} field={'sid'} sortable />
                        <Column key={'status'} header={'Status'} field={'status'} sortable
                            body={rowData => <Tag value={rowData.status} severity={rowData.status == 'Active' ? 'success' : 'danger'} />} />
                        <Column key={'id'} header={''} field={'id'} sortable
                            body={(rowData) => (
                                <div className='table-action'>
                                    <Button label="Edit" className="p-button-rounded m-1" onClick={() => onAction(_ACT_TYPE.UPDATE_NUMBER, rowData)} />
                                    <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(_ACT_TYPE.DELETE_NUMBER, rowData)} />
                                </div>
                            )} />
                    </DataTable>
                </SplitterPanel>
            </Splitter>
            <Dialog
                open={selectedItem.visible || false}
                scroll={'paper'} maxWidth={'md'} fullWidth
                aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description"
                onClose={handleClose}
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>{_isAdd ? 'Add Number' : 'Update Number'}</DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="sid" label="SID" required variant="outlined" placeholder='SID'
                            value={_data.sid || ''}
                            onChange={e => updateSelectionData({ sid: e.target.value })} />
                    </FormControl>

                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="fromnumber" label="From Number" required variant="outlined" placeholder='From Number'
                            type={'number'}
                            value={`${_data.fromnumber}`}
                            onChange={e => updateSelectionData({ fromnumber: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="p-2">
                        <FormControlLabel
                            control={
                                <InputSwitch
                                    className='m-2'
                                    checked={_data.status == 'Active'}
                                    onChange={e => updateSelectionData({ status: e.target.value ? 'Active' : 'Inactive' })}
                                />
                            }
                            label="Active"
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default TwilioAccounts;