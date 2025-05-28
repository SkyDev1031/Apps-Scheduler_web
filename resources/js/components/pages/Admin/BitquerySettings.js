import {
    Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, FormControlLabel, TextField
} from '@mui/material';
import { Button, DataTable, InputSwitch, InputText, InputNumber, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { useEffect, useState } from 'react';
import { deleteBitqueryApi, getBitqueryApi, updateBitqueryApi, getBitqueryTemplateSettings, updateBitqueryTemplateSettingApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from "../../contexts";
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
}

const BitquerySettings = () => {
    const [settings, setSettings] = useState([])
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();

    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    });
    const [isRegisteration, setRegisteration] = useState(true);
    const [isMarketplace, setMarketplace] = useState(true);
    const [isStackingTab, setStackingTab] = useState(true);
    const [registerNum, setRegister] = useState(100);

    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD;
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;
    const _label = _isAdd ? 'Add New client' : _isEdit ? 'Edit client' : 'Dialog';

    useEffect(() => {
        getSettings();
        getTemplateSettings();
    }, [])

    const getSettings = () => {
        setLoading(true);
        getBitqueryApi()
            .then(res => setSettings(res.data))
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }

    const getTemplateSettings = () => {
        getBitqueryTemplateSettings()
            .then((res) => {
                if (res.success) {
                    console.log("BitquerySettings getTemplateSettings res.data[0] === : ", res.data);
                    setRegisteration(res.data.isRegistration === 1 ? true : false);
                    setMarketplace(res.data.isMarketplace === 1 ? true : false);
                    setStackingTab(res.data.isStackingTab === 1 ? true : false);
                    setRegister(res.data.register);
                }
            })
            .catch((error) => {
                console.log("BitquerySettings getTemplateSettings error === : ", error);
                toast_error("Invalid Server Connection!");
            })
    }

    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleClose = () => {
        initSelection();
    };
    const handleTemplateSettings = async (key, value) => {
        console.log("BitquerySettings handleTemplateSettings ", " === ", key, value);
        if (value === true) {
            value = 1;
        } else if (value === false) {
            value = 0;
        }
        let res = await updateBitqueryTemplateSettingApi({ key: key, value: value });
        console.log("BitquerySettings", " === ", res);
        if (res.success) {
            toast_success(res?.message);
            if (key === "isRegistration") {
                setRegisteration(value === 1 ? true : false);
            } else if (key === "isMarketplace") {
                setMarketplace(value === 1 ? true : false);
            } else if (key === "isStackingTab") {
                setStackingTab(value === 1 ? true : false);
            } else if (key === "register") {
                setRegister(value);
            }
        } else {
            toast_error("Invalid Server Connection!");
        }
    }
    const handleAction = async () => {
        if (!_data.value) return toast_error('Please enter the API key', _ERROR_CODES.INVALID_INPUT);
        if (!_data.etc) return toast_error('Please enter the billing day of month', _ERROR_CODES.INVALID_INPUT);
        if (!(0 < _data.etc && _data.etc <= 31)) return toast_error('Please enter the valid billing day of month (1~31)', _ERROR_CODES.INVALID_INPUT);
        setLoading(true);
        var res = await updateBitqueryApi(_data)
            .catch(err => toast_error(err, _ERROR_CODES.SEND_TEXT_ERROR))
        if (res?.success) {
            toast_success(res?.message);
            initSelection();
            getSettings();
        }
        setLoading(false);
    }
    const OnActions = async (data, type) => {
        if (type === _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            const res = await deleteBitqueryApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message)
                getSettings();
            }
        } else {
            initSelection({ data, visible: true, type });
        }
    }
    return (
        <>
            <DataTable value={settings} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add New Client' onClick={() => OnActions({ id: 0 }, _ACT_TYPE.ADD)} />
                        <div className="p-input-icon-left my-auto d-flex">
                            <div className=''>
                                <h6>Registration</h6>
                                <InputSwitch
                                    id="registerationSwitch"
                                    name="registerationSwitch"
                                    checked={isRegisteration}
                                    onChange={(e) => {
                                        handleTemplateSettings("isRegistration", e.target.value);
                                    }}
                                />
                            </div>
                            {
                                isRegisteration && <div className='ml-10px width-100px'>
                                    <h6>Limit</h6>
                                    <InputNumber className="pl-5px pr-5px pt-2px pb-2px" value={registerNum} onValueChange={(e) => handleTemplateSettings("register", e.value)} min={100} placeholder="Users Limit" />
                                </div>
                            }
                        </div>
                        <div className="p-input-icon-left my-auto">
                            <h6>Marketplace</h6>
                            <InputSwitch
                                id="marketplaceSwitch"
                                name="marketplaceSwitch"
                                checked={isMarketplace}
                                onChange={(e) => {
                                    handleTemplateSettings("isMarketplace", e.target.value);
                                }}
                            />
                        </div>
                        <div className="p-input-icon-left my-auto">
                            <h6>Stacking Tab</h6>
                            <InputSwitch
                                id="stackingTabSwitch"
                                name="stackingTabSwitch"
                                checked={isStackingTab}
                                onChange={(e) => {
                                    handleTemplateSettings("isStackingTab", e.target.value);
                                }}
                            />
                        </div>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'value'} header={'Key'} field={'value'} sortable />
                <Column key={'refresh_date'} header={'Billing day of month'} field={'etc'} sortable />
                <Column key={'status'} header={'Status'} field={'status'} sortable
                    body={rowData => <Tag value={rowData.status == 1 ? 'Active' : 'Inactive'} severity={rowData.status == 1 ? 'success' : 'danger'} />} />

                <Column key={'id'} header={''} field={'id'} sortable
                    body={(data) => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => OnActions(data, _ACT_TYPE.EDIT)} />
                            <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => OnActions(data, _ACT_TYPE.DELETE)} />
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
                    <FormControl fullWidth className="mb-4">
                        <TextField id="outlined-basic" label="API Key" required variant="outlined" placeholder='API Key'
                            value={_data.value || ''}
                            onChange={e => updateSelectionData({ value: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="mb-4">
                        <TextField id="outlined-basic" label="Billing day of month" required variant="outlined" placeholder='Billing day of month'
                            value={`${_data.etc || 0}`}
                            type={'number'}
                            onChange={e => updateSelectionData({ etc: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="p-2">
                        <FormControlLabel
                            control={
                                <InputSwitch
                                    className='m-2'
                                    checked={_data.status == 1}
                                    onChange={e => updateSelectionData({ status: e.target.value ? 1 : 0 })}
                                />
                            }
                            label="Active"
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>{'Cancel'}</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default BitquerySettings;