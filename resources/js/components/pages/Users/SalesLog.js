import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesLogApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error } from '../../utils';

const SalesLog = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading } = useGlobalContext();
    const navigate = useNavigate();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await salesLogApi();
            setData(res.logs)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])

    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
            resizableColumns columnResizeMode="fit" showGridlines
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
            filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
            header={() => (
                <div className="justify-content-end d-flex">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                </div>
            )}
        >
            <Column key={'SaleDate'} header={'Date'} field={'SaleDate'} sortable
                body={rowData => moment(rowData.SaleDate).format('lll')}
            />
            <Column key={'ProductName'} header={'Product Name'} field={'ProductName'} sortable />
            <Column key={'CategoryName'} header={'Category'} field={'CategoryName'} sortable />
            <Column key={'fullname'} header={'Buyer'} field={'fullname'} sortable />
            <Column key={'ProductPrice'} header={'Price'} field={'ProductPrice'} sortable
                body={rowData => `$${rowData.ProductPrice}`}
            />
            <Column key={'BuyerFees'} header={'Fees'} field={'BuyerFees'} sortable
                body={rowData => `$${rowData.BuyerFees}`}
            />
            <Column key={'BillingAmount'} header={'Total Amount'} field={'BillingAmount'} sortable
                body={rowData => `${rowData.BillingAmount} ${rowData.CryptoName}`}
            />
            <Column key={'id'} field={'id'} header={'Action'}
                body={(rowData) => (
                    <div className='table-action'>
                        <Button label="Order Details" className="p-button-rounded m-1" onClick={() => navigate(`/user/marketplace/${rowData.ProductID}`)} />
                    </div>
                )} />
        </DataTable>
    )
};

export default SalesLog;