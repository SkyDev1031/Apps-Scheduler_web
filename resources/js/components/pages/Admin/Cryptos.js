import {
    Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, IconButton, MenuItem, Select, TextField
} from '@mui/material';
import { Button, Checkbox, Column, DataTable, InputText } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useRef, useState } from 'react';
import { deleteCryptoApi, updateCryptoApi, updateCryptoOptionsApi, uploadApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from '../../components';
import { DEF_IMAGE, _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
    UPDATE_SHOW: 3,
    UPDATE_PULSE: 4,
    UPDATE_EXPLORER: 5,
    UPDATE_DISCOUNT: 6,
}

const Cryptos = () => {
    const [query, setQuery] = useState('')
    const { setLoading, activeContracts, cryptos, getInitialData, confirmDialog } = useGlobalContext();
    const [selectedFile, setSelectedFile] = useState(null)
    const [discountValue, setDiscountValue] = useState({})
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    })
    const fileInput = useRef();
    const _data = selectedItem.data || {};
    const _isAdd = selectedItem.type == _ACT_TYPE.ADD;
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;
    const _label = _isAdd ? 'Add New crypto' : _isEdit ? 'Edit crypto' : 'Dialog';

    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleClose = () => {
        initSelection();
    };
    const handleAction = async () => {
        if (!_data.Image && !selectedFile?.file) return toast_error('Please choose the Image.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.CryptoName) return toast_error('Please enter the Crypto Name.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.contractId) return toast_error('Please choose the contract.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.contract_address) return toast_error('Please enter the contract address.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.DepositFee) return toast_error('Please enter the deposit fee.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.WithdrawalFee) return toast_error('Please enter the expedited withdarwal fee.', _ERROR_CODES.INVALID_INPUT);
        if (!_data.TransferFee) return toast_error('Please enter the standard transfer fee.', _ERROR_CODES.INVALID_INPUT);
        setLoading(true);
        var res;
        if (selectedFile?.file) {
            const filename = `${(new Date()).getTime()}_${selectedFile?.file.name}`;
            var formdata = new FormData();
            formdata.append('path', 'uploads/cryptoimages');
            formdata.append('filename', filename);
            formdata.append('file', selectedFile?.file);
            res = await uploadApi(formdata).catch(console.error);
            if (res) _data.Image = filename;
            else _data.Image = '';
        }
        res = await updateCryptoApi(_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message)
            // await getInitialData();
            handleClose();
        }
        setLoading(false);
    }

    const onAction = async (data, type) => {
        if (type == _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            setLoading(true);
            const res = await deleteCryptoApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            toast_success(res.message)
            // await getInitialData();
            setLoading(false);
        } else if (type == _ACT_TYPE.UPDATE_SHOW || type == _ACT_TYPE.UPDATE_PULSE || type == _ACT_TYPE.UPDATE_EXPLORER || type == _ACT_TYPE.UPDATE_DISCOUNT) {
            setLoading(true)
            const res = await updateCryptoOptionsApi({ ...data, type })
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            toast_success(res.message)
            // await getInitialData();
            setLoading(false)
        } else {
            initSelection({ data, visible: true, type });
        }
    }

    const onChange = async (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file)
        setSelectedFile({ file, url });
    }
    const updateDiscount = (item) => setDiscountValue(prev => ({ ...prev, ...item }))

    return (
        <>
            <input
                ref={fileInput}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={onChange}
            />

            <DataTable value={cryptos} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add new token' onClick={() => onAction({}, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'Name'} header={'Name'} field={'CoinID'} sortable
                    style={{ width: '30%' }}
                    body={(rowData => (
                        <div style={{ minWidth: 150 }}>
                            <div className='crypto-cell'>
                                <Image src={crypto_path(rowData.Image)} />
                                <span>{rowData.CryptoName}</span>
                                <div className='info-text' style={{ paddingLeft: 10 }}>{`$${rowData.Price}`}</div>
                            </div>
                        </div>
                    ))} />
                <Column key={'total_balance'} header={'Balance'} field={'total_balance'} sortable
                    body={rowData => <NumberView value={rowData.total_balance} color={'#4743c9'} bold />} />
                <Column key={'contract_address'} header={'Contract Address'} field={'contract_address'} sortable />
                <Column key={'DepositFee'} header={'Deposit Fee %'} field={'DepositFee'} sortable
                    body={rowData => <NumberView value={rowData.DepositFee} color={'#4743c9'} bold decimal={2} />} />
                <Column key={'WithdrawalFee'} header={'Withdarwal Fee %'} field={'WithdrawalFee'} sortable
                    body={rowData => <NumberView value={rowData.WithdrawalFee} color={'#4743c9'} bold decimal={2} />} />
                <Column key={'TransferFee'} header={'Transfer Fee %'} field={'TransferFee'} sortable
                    body={rowData => <NumberView value={rowData.TransferFee} color={'#4743c9'} bold decimal={2} />} />
                <Column key={'SwapFee'} header={'Swap Fee %'} field={'SwapFee'} sortable
                    body={rowData => <NumberView value={rowData.SwapFee} color={'#4743c9'} bold decimal={2} />} />
                <Column key={'SwapNetworkFee'} header={'Swap Network Fee %'} field={'SwapNetworkFee'} sortable
                    body={rowData => <NumberView value={rowData.SwapNetworkFee} color={'#4743c9'} bold decimal={2} />} />
                <Column key={'visible'} header={'Show'} field={'visible'} sortable
                    body={rowData => (
                        <Checkbox checked={rowData.visible == 1} onChange={e => onAction(rowData, _ACT_TYPE.UPDATE_SHOW)} />
                    )} />
                <Column key={'pulse'} header={'Pulse'} field={'pulse'} sortable
                    body={rowData => (
                        <Checkbox checked={rowData.pulse == 1} onChange={e => onAction(rowData, _ACT_TYPE.UPDATE_PULSE)} />
                    )} />
                <Column key={'explorer'} header={'Explorer'} field={'explorer'} sortable
                    body={rowData => (
                        <Checkbox checked={rowData.explorer == 1} onChange={e => onAction(rowData, _ACT_TYPE.UPDATE_EXPLORER)} />
                    )} />
                <Column key={'discount'} header={'Discount'} field={'discount'} sortable style={{ minWidth: 200 }}
                    body={rowData => {
                        var value = discountValue[rowData.id];
                        if (value == null) value = rowData.discount || '';
                        return (
                            <div className='d-flex'>
                                <input type={'number'}
                                    value={`${value}`}
                                    placeholder={'discount (%)'} onChange={e => updateDiscount({ [rowData.id]: e.target.value })} />
                                {rowData.discount != value &&
                                    <>
                                        <a type="button" className="success-text p-2"
                                            onClick={() => onAction({ id: rowData.id, value }, _ACT_TYPE.UPDATE_DISCOUNT)}
                                        >&radic;</a>
                                        <a type="button" className="error-text p-2"
                                            onClick={() => updateDiscount({ [rowData.id]: rowData.discount })}>&Chi;</a>
                                    </>
                                }
                            </div>
                            // <Checkbox checked={rowData.discount == 1} onChange={e => onAction(rowData, _ACT_TYPE.UPDATE_DISCOUNT)} />
                        )
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
                scroll={'paper'} maxWidth={'md'} fullWidth
                aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description"
                onClose={handleClose}
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>{_label}</DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <div className='row width-full mb-2 p-2'>
                        <FormControl className="col-md-8 p-2">
                            <TextField id="image_input" label="Image" required variant="outlined" placeholder='Image'
                                disabled value={selectedFile?.file?.name || _data.Image || ''}
                                onClick={() => fileInput.current.click()} />

                            <TextField id="crypto_name" label="Crypto Name" required variant="outlined" placeholder='Crypto Name'
                                className='mt-4'
                                value={_data.CryptoName || ''}
                                onChange={e => updateSelectionData({ CryptoName: e.target.value })} />
                        </FormControl>
                        <FormControl className="col-md-3">
                            <Image src={selectedFile?.url || (_data.Image ? crypto_path(_data.Image) : DEF_IMAGE.marketplace)} className="package-image" def={DEF_IMAGE.marketplace} />
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
                    <FormControl fullWidth className="mt-2 p-2">
                        {activeContracts.length === 0 && <div className="color-danger" style={{ padding: 12 }}>There is no active contract.</div>}
                        <Select
                            className="crypto-selector-img"
                            value={_data.contractId || 0}
                            onChange={e => updateSelectionData({ contractId: e.target.value })}
                            inputProps={{
                                className: "crypto-selector-img"
                            }}>
                            <MenuItem value={0} key={0} disabled>
                                <div style={{ padding: 12 }}>Select Contract</div>
                            </MenuItem>
                            {activeContracts?.map((contract, cIndex) => (
                                <MenuItem value={contract.id} key={cIndex}>
                                    <div style={{ padding: 12 }}> {contract.address}</div>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="contract_address" label="Token Address" required variant="outlined" placeholder='Token Address'
                            value={_data.contract_address || ''}
                            onChange={e => updateSelectionData({ contract_address: e.target.value })} />
                    </FormControl>

                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="deposit_fee" label="Deposit Fee %" required variant="outlined" placeholder='Deposit fee'
                            type={'number'}
                            value={`${_data.DepositFee}`}
                            onChange={e => updateSelectionData({ DepositFee: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="withdrawal_fee" label="Withdrawal Fee %" required variant="outlined" placeholder='Withdrawal Fee'
                            type={'number'}
                            value={`${_data.WithdrawalFee}`}
                            onChange={e => updateSelectionData({ WithdrawalFee: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="transfer_fee" label="Transfer Fee Expedited %" required variant="outlined" placeholder='Transfer Fee Expedited'
                            type={'number'}
                            value={`${_data.TransferFee}`}
                            onChange={e => updateSelectionData({ TransferFee: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="swap_fee" label="Swap Fee %" required variant="outlined" placeholder='Swap Fee'
                            type={'number'}
                            value={`${_data.SwapFee}`}
                            onChange={e => updateSelectionData({ SwapFee: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="swap_network_fee" label="Swap Network Fee %" required variant="outlined" placeholder='Swap Network Fee %'
                            type={'number'}
                            value={`${_data.SwapNetworkFee}`}
                            onChange={e => updateSelectionData({ SwapNetworkFee: e.target.value })} />
                    </FormControl>

                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Save Crypto'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Cryptos;