import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { myOrderApi } from '../../api/OriginAPI.js';
import { NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error } from '../../utils';

const Purchases = () => {
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
            const res = await myOrderApi();
            setData(res.orders)
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
            <Column key={'ProductName'} header={'Product Name'} field={'ProductName'} sortable style={{ color: '#00a654' }} />
            <Column key={'item_type'} header={'Product Type'} field={'item_type'} sortable />
            <Column key={'fullname'} header={'Seller'} field={'fullname'} sortable />
            <Column key={'ProductPrice'} header={'Price'} field={'ProductPrice'} sortable
                body={rowData => <NumberView value={rowData.ProductPrice} color={'#ffba00'} />}
            />
            <Column key={'BuyerFees'} header={'Fees'} field={'BuyerFees'} sortable
                body={rowData => <NumberView value={rowData.BuyerFees} color={'#ffba00'} />}
            />
            <Column key={'BillingAmount'} header={'Total Spent'} field={'BillingAmount'} sortable style={{ color: '#ffba00' }}
                body={rowData => (<><NumberView value={rowData.BillingAmount} color={'#ffba00'} /> {rowData.CryptoName}</>)}
            />
            <Column key={'expire_days_left'} header={'Days left to Expire'} field={'expire_days_left'} sortable />

            <Column key={'id'} field={'id'} header={''}
                body={(rowData) => (
                    <div className='table-action'>
                        <Button label="Details" className="p-button-rounded m-1" onClick={() => navigate(`/user/marketplace/${rowData.ProductID}`)} />
                        {/* {!rowData.rated && <Button label="Leave Feedback" className="p-button-rounded p-button-success m-1" />} */}
                        {rowData.TypeOfItem != 'Physical' && <Button label="Download" className="p-button-rounded p-button-info m-1" onClick={() => navigate(`/user/marketplace/download/${rowData.ProductID}`)} />}
                    </div>
                )} />
        </DataTable>
    )
};

export default Purchases;