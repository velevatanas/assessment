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

  const { data: products, isLoading } = useQuery(["products", search], () =>
    fetchProducts(search)
  );

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
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) return <p>Loading products...</p>;

  return (
    <div className="products-container">
      <div className="header">
        <h1>Products</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {!products || products.length === 0 ? (
        <p></p>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Products;

