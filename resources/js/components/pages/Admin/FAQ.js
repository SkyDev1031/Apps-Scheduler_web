import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { Button, Column, DataTable, InputText } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { deleteFaqApi, getFaqApi, updateFaqApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';


const _ACT_TYPE = {
    DEFAULT: -1,
    ADD: 0,
    EDIT: 1,
    DELETE: 2,
}
const FAQ = () => {
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
    const _label = _isAdd ? 'Add New Faq' : _isEdit ? 'Edit Faq' : 'Dialog';

    const updateSelectionData = (item) => setSelectedItem(bef => ({ ...bef, data: { ...bef.data, ...item } }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    useEffect(() => {
        getData();
    }, [])
    const getData = () => {
        setLoading(true)
        getFaqApi()
            .then(res => setData(res.data))
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const handleClose = () => {
        initSelection();
    };
    const handleAction = async () => {
        if (!_data.question) return toast_error('Please enter the question', _ERROR_CODES.INVALID_INPUT);
        if (!_data.answer) return toast_error('Please enter the answer', _ERROR_CODES.INVALID_INPUT);
        setLoading(true);
        const res = await updateFaqApi(_data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res.message);
            handleClose()
            getData();
        }
    }
    const OnActions = async (data, type) => {
        if (type === _ACT_TYPE.DELETE) {
            const isDelete = await confirmDialog();
            if (!isDelete) return;
            const res = await deleteFaqApi(data.id)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res?.message)
                getData();
            }
        } else {
            initSelection({ data, visible: true, type });
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
                        <Button label='Add New Faq' onClick={() => OnActions({ id: 0 }, _ACT_TYPE.ADD)} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'question'} header={'Question'} field={'question'} sortable />
                <Column key={'answer'} header={'Answer'} field={'answer'} sortable />
                <Column key={'id'} header={'Action'} field={'id'} sortable
                    body={(rowData) => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => OnActions(rowData, _ACT_TYPE.EDIT)} />
                            <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => OnActions(rowData, _ACT_TYPE.DELETE)} />
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
                        <TextField id="outlined-basic" label="Question" required variant="outlined" placeholder='Question'
                            value={_data.question || ''}
                            onChange={e => updateSelectionData({ question: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth variant="outlined" className="mb-4">
                        <TextField id="standard-multiline-flexible"
                            label="Answer" required maxRows={1}
                            multiline variant="outlined"
                            value={_data.answer || ''}
                            onChange={e => updateSelectionData({ answer: e.target.value })} />
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
export default FAQ;