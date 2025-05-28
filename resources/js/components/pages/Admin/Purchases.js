import moment from 'moment';
import { Button, Column, DataTable, InputText, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deletePurchasesApi, getPurchasesApi } from '../../api/OriginAPI.js';
import { NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const Wallet = (props) => {
    const { id } = useParams()
    const _id = props.id || id;
    const isManager = _id == 1 || _id == 0;

    const [data, setData] = useState([])
    const [query, setQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();
    useEffect(() => {
        getPurchases();
    }, [])
    const getPurchases = () => {
        setLoading(true)
        getPurchasesApi(_id)
            .then(res => setData(res.data))
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    };
    const onDelete = async ({ id }) => {
        const isDelete = await confirmDialog();
        if (!isDelete) return;
        setLoading(true);
        const res = await deletePurchasesApi(id).catch(err => toast_error(err, _ERROR_CODES.DELETE_PURCHASE_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            getPurchases();
        }
    }

    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
            resizableColumns columnResizeMode="fit" showGridlines
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
            filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
            header={() => (
                <div className="justify-content-between d-flex">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                </div>
            )}
        >
            <Column key={'fullname'} header={'Client'} field={'fullname'} sortable />
            <Column key={'PackageName'} header={'Package'} field={'PackageName'} sortable />
            <Column key={'price'} header={'Price'} field={'price'} sortable style={{ color: '#ffba00' }}
                body={(rowData) => <NumberView value={rowData.price} decimal={4} suffix={rowData.CryptoName} />} />
            <Column key={'purchase_date'} header={'Purchase Date'} field={'purchase_date'} sortable
                body={(rowData) => moment(rowData.purchase_date).format('ll')} />
            <Column key={'expiry_date'} header={'Expire Date'} field={'expiry_date'} sortable
                body={(rowData) => moment(rowData.expiry_date).format('ll')} />
            <Column key={'status'} header={'Status'} field={'status'} sortable
                body={rowData => <Tag value={rowData.status} severity={rowData.status == 'Active' ? 'success' : 'danger'} />} />
            <Column key={'id'} header={''} field={'id'} sortable
                body={(rowData) => (
                    <div className='table-action'>
                        <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onDelete(rowData)} />
                    </div>
                )} />
        </DataTable>
    )
}
export default Wallet;