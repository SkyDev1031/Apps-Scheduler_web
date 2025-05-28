import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from '@mui/material';
import { Button, Column, DataTable, InputSwitch, InputText, Tag, InputNumber } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { deletePackageApi, packagesApi, updatePackageApi, uploadApi } from '../../api/OriginAPI.js';
import { Image } from '../../components';
import { DEF_IMAGE, toolbarOptions, _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { packages_path, toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
}
const Packages = () => {
    const [data, setData] = useState([])
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    })
    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD;
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInput = useRef();

    useEffect(() => {
        getPackages();
    }, [])
    const getPackages = () => {
        setLoading(true)
        packagesApi()
            .then(res => setData(res.packages))
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }

    const updateSelectionData = (item) => {
        setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    };
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const onAction = async (data, type) => {
        if (type == _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            const res = await deletePackageApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message);
                getPackages();
            }
        } else {
            initSelection({ type, data, visible: true });
        }
    }
    const handleAction = async () => {
        if (!_data.Image && !selectedFile?.file) return toast_error('Please choose the Image.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.PackageName) return toast_error('Please enter the Package Name.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.Description) return toast_error('Please enter the Package Name.', _ERROR_CODES.INVALID_INPUT);
        if (
            !(_data.CryptoAmount > 0 && _data.BillingIntervalDays > 0) &&
            !(_data.CryptoAmount90 > 0 && _data.BillingIntervalDays90 > 0) &&
            !(_data.CryptoAmount365 > 0 && _data.BillingIntervalDays365 > 0)
        )
            return toast_error('You have to select at least one billing plan.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.FolderName) return toast_error('Please enter the Folder Name.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.BinaryPayoutEligible) _data.BinaryPayoutEligible = 'N';
        if (!_data.status) _data.status = 'Inactive';
        if (!_data.limit) return toast_error("Please enter limit user number", _ERROR_CODES.INVALID_INPUT);
        if (parseFloat(_data.limit) < 10 || parseFloat(_data.limit) > 9999) return toast_error("Please set limit user number between 10 - 9999", _ERROR_CODES.INVALID_INPUT);

        setLoading(true);
        var res;
        if (selectedFile?.file) {
            const filename = `${(new Date()).getTime()}_${selectedFile?.file.name}`;
            var formdata = new FormData();
            formdata.append('path', 'uploads/packageimages');
            formdata.append('filename', filename);
            formdata.append('file', selectedFile?.file);
            res = await uploadApi(formdata).catch(console.error);
            if (res) _data.Image = filename;
            else _data.Image = '';
        }
        const tmp_data = {
            Image: '', BinaryPayoutEligible: "N", status: "Inactive", PackageOrder: (data?.length || 0) + 1, CryptoID: 1,
            CryptoAmount: 0, BillingIntervalDays: 0, CryptoAmount90: 0, CryptoAmount365: 0,
            BillingIntervalDays90: 0, BillingIntervalDays365: 0,
            ..._data
        }
        res = await updatePackageApi(tmp_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            initSelection();
            getPackages();
        }
    }
    const onChange = async (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file)
        setSelectedFile({ file, url });
    }
    const IntervalInput = ({ id, isAmount }) => {
        const label = isAmount ? "Crypto amount" : 'Billing Interval days'
        return (
            <div className="col-md-6 col-sm-6 col-lg-6 p-2">
                <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor={id}>{label}</InputLabel>
                    <OutlinedInput
                        id={id}
                        type={'number'}
                        label={label}
                        defaultValue={`${_data[id]}`}
                        onChange={e => _data[id] = e.target.value}
                        endAdornment={
                            <InputAdornment position="end">
                                <span>{isAmount ? '$' : 'Days'}</span>
                            </InputAdornment>
                        }
                    />
                </FormControl>
            </div>
        )
    }

    return (
        <>
            <input
                ref={fileInput}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onChange}
            />
            <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add New Package' onClick={() => onAction({ id: 0 }, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'PackageName'} header={'Package Name'} field={'PackageName'} sortable
                    body={(rowData => (
                        <div className='crypto-cell'>
                            <Image src={packages_path(rowData.Image)} def={DEF_IMAGE.marketplace} />
                            <span>{rowData.PackageName}</span>
                        </div>
                    ))}
                />
                <Column key={'CryptoAmount'} header={'Crypto Amount'} field={'CryptoAmount'} sortable />
                <Column key={'BillingIntervalDays'} header={'Days'} field={'BillingIntervalDays'} sortable
                    body={(rowData) => rowData.BillingIntervalDays == 0 ? 'Unlimited' : rowData.BillingIntervalDays} />
                <Column key={'limit'} header={'Limit'} field={'limit'} sortable body={(rowData) => rowData.limit} />
                <Column key={'status'} header={'Status'} field={'status'} sortable
                    body={(rowData) => {
                        if (rowData.limit <= rowData.userNum) {
                            return (
                                <Tag value={"Sold Out"} severity={'danger'} />
                            )
                        } else {
                            return (
                                <Tag value={rowData.status} severity={rowData.status == 'Active' ? 'success' : 'danger'} />
                            )
                        }

                    }} />
                <Column key={'id'} header={''} field={'id'} sortable
                    body={(rowData) => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => onAction(rowData, _ACT_TYPE.EDIT)} />
                            <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(rowData, _ACT_TYPE.DELETE)} />
                        </div>
                    )} />
            </DataTable>
            <Dialog
                open={selectedItem.visible || false}
                onClose={initSelection}
                scroll={'paper'}
                maxWidth={'lg'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>
                    {_isEdit ? 'Edit package' : 'Add package'}
                    <IconButton
                        aria-label="close"
                        onClick={initSelection}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <i className="pi pi-times" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <div className='row width-full mb-2 p-2'>
                        <FormControl className="col-md-8 p-2">
                            <TextField id="image-input" label="Image" required variant="outlined" placeholder='Image'
                                disabled value={selectedFile?.file?.name || _data.Image || ''}
                                onClick={() => fileInput.current.click()} />
                            <TextField id="image-input" label="Name" required variant="outlined" placeholder='Name'
                                className='mt-4'
                                value={_data.PackageName || ''}
                                onChange={e => updateSelectionData({ PackageName: e.target.value })} />
                        </FormControl>
                        <FormControl className="col-md-3">
                            <Image src={selectedFile?.url || (_data.Image ? packages_path(_data.Image) : DEF_IMAGE.marketplace)} className="package-image" def={DEF_IMAGE.marketplace} />
                        </FormControl>
                        <FormControl className="col-md-1">
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                }}
                                onClick={() => {
                                    setSelectedFile(null);
                                    updateSelectionData({ Image: null });
                                }}>
                                <i className='pi pi-times' />
                            </IconButton>
                        </FormControl>
                    </div>
                    <InputLabel>{'Description'}</InputLabel>
                    <FormControl fullWidth className="description-input">
                        <ReactQuill
                            id="description"
                            theme="snow"
                            modules={{ toolbar: toolbarOptions }} style={{ height: 200 }}

                            value={_data.Description || ''}
                            onChange={Description => updateSelectionData({ Description })} />
                    </FormControl>
                    <br />
                    <InputLabel className='mt-2'>{'Crypto Amount $ & Billing Interval Days'}</InputLabel>
                    <div className='row width-full p-2'>
                        <IntervalInput id={'CryptoAmount'} isAmount />
                        <IntervalInput id={'BillingIntervalDays'} />

                        <IntervalInput id={'CryptoAmount90'} isAmount />
                        <IntervalInput id={'BillingIntervalDays90'} />

                        <IntervalInput id={'CryptoAmount365'} isAmount />
                        <IntervalInput id={'BillingIntervalDays365'} />


                        <div className="col-md-6 col-sm-6 col-lg-6 p-2">
                            <FormControl fullWidth className="mt-3">
                                <TextField id="foldername" label="Folder Name" required variant="outlined" placeholder='Folder Name'
                                    value={_data.FolderName || ''}
                                    onChange={e => updateSelectionData({ FolderName: e.target.value })} />
                            </FormControl>
                        </div>
                        <div className="col-md-6 col-sm-6 col-lg-6 p-2">
                            <FormControl fullWidth variant="outlined" className="mt-3">
                                <InputLabel htmlFor={"limit"}>{"Limit User Number"}</InputLabel>
                                <OutlinedInput
                                    id={"limit"}
                                    type={'number'}
                                    label={"Limit User Number"}
                                    defaultValue={`${_data.limit}`}
                                    onChange={e => updateSelectionData({ limit: e.target.value })}
                                />
                            </FormControl>
                        </div>
                    </div>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="foldername" label="Folder Name" required variant="outlined" placeholder='Folder Name'
                            value={_data.FolderName || ''}
                            onChange={e => updateSelectionData({ FolderName: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="p-2">
                        <FormControlLabel
                            control={
                                <InputSwitch
                                    required
                                    className='m-2'
                                    checked={_data.BinaryPayoutEligible == 'Y'}
                                    onChange={e => updateSelectionData({ BinaryPayoutEligible: e.target.value ? 'Y' : 'N' })}
                                />
                            }
                            label="Binary Payout Eligible"
                        />
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
                    <Button className='p-button-danger' onClick={initSelection}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Packages;