import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, TextField } from '@mui/material';
import { Button, Column, DataTable, InputSwitch, InputText, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { deleteCategoryApi, getCategoriesApi, updateCategoryApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
}
const Wallet = () => {
    const [data, setData] = useState([])
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        type: _ACT_TYPE.DEFAULT,
        data: {}
    })
    const _data = selectedItem.data || {};
    const _isEdit = selectedItem.type == _ACT_TYPE.EDIT;

    useEffect(() => {
        getCategories();
    }, [])
    const getCategories = () => {
        setLoading(true)
        getCategoriesApi()
            .then(res => setData(res.data))
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const onAction = async (data, type) => {
        if (type == _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            setLoading(true);
            const res = await deleteCategoryApi(data.ID)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message);
                getCategories();
            }
        } else {
            initSelection({ type, data, visible: true });
        }
    }
    const handleAction = async () => {
        if (!_data.CategoryName) return toast_error('Please put the category name.', _ERROR_CODES.INVALID_INPUT);

        setLoading(true);
        var res;
        const tmp_data = {
            status: "I",
            ..._data
        }
        res = await updateCategoryApi(tmp_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            initSelection();
            getCategories();
        }
    }

    return (
        <>
            <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Add New Category' onClick={() => onAction({ id: 0 }, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'CategoryName'} header={'Category'} field={'CategoryName'} sortable />
                <Column key={'Status'} header={'Status'} field={'Status'} sortable
                    body={rowData => <Tag value={rowData.Status == 'A' ? 'Active' : 'Inactive'} severity={rowData.Status == 'A' ? 'success' : 'danger'} />} />
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
                maxWidth={'sm'}
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
                    <FormControl fullWidth className="mt-2 p-2">
                        <TextField id="CategoryName" label="Category Name" required variant="outlined" placeholder='Category Name'
                            value={_data.CategoryName || ''}
                            onChange={e => updateSelectionData({ CategoryName: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className="p-2">
                        <FormControlLabel
                            control={
                                <InputSwitch
                                    className='m-2'
                                    checked={_data.Status == 'A'}
                                    onChange={e => updateSelectionData({ Status: e.target.value ? 'A' : 'I' })}
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
export default Wallet;