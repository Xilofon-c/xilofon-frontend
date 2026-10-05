import {Navigate} from 'react-router-dom';

type ProtectedRouteProps={
    children: React.ReactNode;
};
const OfficeRoute=({children}: ProtectedRouteProps)=>{
    const role=localStorage.getItem('userRole');
    if(role!=='office'){
        return <Navigate to ='/account' replace />;
    }
    return children;
};

export default OfficeRoute;