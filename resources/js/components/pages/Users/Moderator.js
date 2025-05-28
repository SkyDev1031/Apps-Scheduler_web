import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMarketplaceApi, allMarketplaceApi } from '../../api/OriginAPI.js';
import { NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_success, toast_error } from '../../utils';
import { useChatContext } from '../../Chat';

const Moderator = () => {
    const {
        supportRooms, onAddGroup, refreshSupportRoomList
    } = useChatContext()

    const [query, setQuery] = useState();
    const [data, setData] = useState([]);
    const [load_count, setLoadCount] = useState(0);
    const { setLoading, confirmDialog } = useGlobalContext();
    const navigate = useNavigate();
    useEffect(() => {
        getData();
    }, [getData])


    const getData = useCallback(async (showLoading = true) => {
        try {
            // if(load_count<1){
                // setLoading(showLoading);
                await refreshSupportRoomList();
            // }
            // console.log(load_count);
            // var tem_load_count = load_count;
            // tem_load_count++;
            // setLoadCount(tem_load_count);
            const res = await allMarketplaceApi();
            var temp = supportRooms;
            var CategoryName = "";
            var ProductName = "";
            temp = temp.map(item => {
                CategoryName = "";
                ProductName = "";
                const record = res.marketplace.find(sub_item => sub_item.id == item.product_id)
                if (record) {
                    CategoryName = record.CategoryName;
                    ProductName = record.ProductName;
                }
                return { ...item, CategoryName, ProductName };
            });
            setData(temp);
            const interval = setTimeout(async () => {
                // await refreshSupportRoomList();
                getData();
            }, 10000);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            // setLoading(false);
        }
       
    }, [data])

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
                </div>
            )}
        >
            <Column key={'ProductName'} header={'Product Name'} field={'ProductName'} sortable />
            <Column key={'CategoryName'} header={'Category Name'} field={'CategoryName'} sortable />
            <Column key={'ChatRoomName'} header={'Chat Room Name'} field={'name'} sortable />
            <Column key={'BuyerName'} header={'Buyer Name'} field={'buyer'} sortable />
            <Column key={'SellerName'} header={'Seller Name'} field={'seller'} sortable />
            <Column key={'id'} field={'product_id'} header={''}
                body={(rowData) => {
                    return (
                        <div className='table-action'>
                            <Button label="Support" className="p-button-rounded m-1" onClick={async () => {await onAddGroup(rowData._id); navigate(`/user/marketplace/${rowData.product_id}`);}} />
                        </div>
                    )
                }} />
        </DataTable>
    )
};

export default Moderator;