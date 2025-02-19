import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import API from "../api";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import "./Products.css";

const fetchProducts = async (search) => {
  const { data } = await API.get(`/products/?search=${search}`);
  return data;
};

const selectProduct = async (productId) => {
  const { data } = await API.post(`/products/${productId}/select/`);
  return data;
};

const deselectProduct = async (productId) => {
  const { data } = await API.post(`/products/${productId}/deselect/`);
  return data;
};

const Products = () => {
  const savedSortColumn = localStorage.getItem("sortColumn") || "id";
  const savedSortOrder = localStorage.getItem("sortOrder") || "asc";
  const [sortColumn, setSortColumn] = useState(savedSortColumn);
  const [sortOrder, setSortOrder] = useState(savedSortOrder);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state) => state.auth.tokens?.refresh);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState(localStorage.getItem("search") || "");
  const [selectedProducts, setSelectedProducts] = useState(
    JSON.parse(localStorage.getItem("selectedProducts")) || []
  );

  useEffect(() => {
    localStorage.setItem("search", search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    localStorage.setItem("sortColumn", sortColumn);
    localStorage.setItem("sortOrder", sortOrder);
  }, [sortColumn, sortOrder]);

  const { data: products, isLoading } = useQuery(["products", search], () =>
    fetchProducts(search)
  );

const sortedProducts = () => {
    if (!products) return [];
    return [...products].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
  
      if (sortColumn === "price") {
        valA = parseFloat(valA.replace(/[^0-9.-]+/g, "")); // Remove $ and parse as float
        valB = parseFloat(valB.replace(/[^0-9.-]+/g, "")); // Remove $ and parse as float
      } else {
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
      }
  
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };
  
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const { mutate: handleSelect } = useMutation(selectProduct, {
    onSuccess: (data, productId) => {
      setSelectedProducts((prev) => [...prev, productId]);
      queryClient.invalidateQueries("products");
    },
  });

  const { mutate: handleDeselect } = useMutation(deselectProduct, {
    onSuccess: (data, productId) => {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      queryClient.invalidateQueries("products");
    },
  });

  const handleLogout = async () => {
    if (!refreshToken) return;
    try {
      await API.post("/logout/", { refresh: refreshToken });
      dispatch(logout());
      setSelectedProducts([]);
      localStorage.removeItem("selectedProducts");
      localStorage.removeItem("search");
      localStorage.removeItem("sortColumn");
      localStorage.removeItem("sortOrder");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const user = useSelector((state) => state.auth.user || null);

  if (isLoading) return <p>Loading products...</p>;

  return (
    <div className="products-container">
      <div className="header">
        <h1>Products</h1>
        <div className="user-info">
          {user && <span className="user-email">{user.email}</span>}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      <table className="products-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {sortColumn === "id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("name")}>
              Name {sortColumn === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("description")}>
              Description {sortColumn === "description" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("price")}>
              Price {sortColumn === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th onClick={() => handleSort("stock")}>
              Stock {sortColumn === "stock" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts().length > 0 ? (
            sortedProducts().map((product) => (
              <tr
                key={product.id}
                className={selectedProducts.includes(product.id) ? "selected" : ""}
                onClick={() => {
                  if (!selectedProducts.includes(product.id)) {
                    handleSelect(product.id);
                  } else {
                    handleDeselect(product.id);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
              </tr>
            ))
          ) : (
            [...Array(10)].map((_, index) => (
              <tr key={index}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;


