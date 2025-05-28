import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMarketplaceApi, marketplaceApi } from '../../api/OriginAPI.js';
import { NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_success, toast_error } from '../../utils';

const SaleItems = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([]);
    const { setLoading, confirmDialog } = useGlobalContext();
    const navigate = useNavigate();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async (showLoading = true) => {
        try {
            setLoading(showLoading);
            const res = await marketplaceApi();
            setData(res.marketplace);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])

    const deleteItem = async (item) => {
        const isDelete = await confirmDialog();
        if (!isDelete) return;
        const res = await deleteMarketplaceApi(item.id)
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
        toast_success(res?.messsage);
        getData(false)
    }
    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
            resizableColumns columnResizeMode="fit" showGridlines
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
            filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
            header={() => (
                <div className="d-flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                    </span>
                    <div className='table-action' style={{ position: "absolute", left: 10, top: 15 }}>
                        <Button className="cmn-btn" onClick={() => navigate('/user/marketplace/add')}>Add Item</Button>
                    </div>
                </div>
            )}
        >
            <Column key={'ProductName'} header={'Name'} field={'ProductName'} sortable />
            <Column key={'CategoryName'} header={'Category'} field={'CategoryName'} sortable />
            <Column key={'item_type'} header={'Type Of Item'} field={'item_type'} sortable />
            <Column key={'Quantity'} header={'Quantity'} field={'Quantity'} sortable />
            <Column key={'Price'} header={'Price'} field={'Price'} sortable
                body={rowData => <NumberView value={rowData.Price} />}
            />
            <Column key={'Feature'} header={'Feature Item'} field={'Feature'} sortable />
            <Column key={'Status'} field={'Status'} header={'Status'} sortable />
            <Column key={'BuyCredits'} field={'BuyCredits'} header={'BuyCredits(BUSD)'} sortable />
            <Column key={'id'} field={'id'} header={''}
                body={(rowData) => {
                    return (
                        <div className='table-action'>
                            <Button label="View" className="p-button-rounded m-1" onClick={() => navigate(`/user/marketplace/${rowData.id}`)} />
                            <Button label="Edit" className="p-button-rounded p-button-warning m-1" onClick={() => navigate(`/user/marketplace/edit/${rowData.id}`)} />
                            <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => deleteItem(rowData)} />
                        </div>
                    )
                }} />
        </DataTable>
    )
};

export default SaleItems;