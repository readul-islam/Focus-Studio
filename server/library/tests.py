from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from crm.models import Client
from .models import Product, ProductImage


def create_studio(name="Library Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="library@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Library User"
    user.studio = studio
    user.role = role
    user.save()
    return user


def create_supplier(studio, user):
    return Client.objects.create(
        studio=studio, name="Supplier", company_name="Supply Co",
        email="supplier@co.com", contact_type="SP", created_by=user,
    )


def create_product(studio, user, supplier=None, name="Test Chair"):
    return Product.objects.create(
        studio=studio, name=name, supplier=supplier,
        currency="GBP", regular_price=250.0, created_by=user,
    )


# ---------------------------------------------------------------------------
# Product CRUD
# ---------------------------------------------------------------------------

class ProductTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.supplier = create_supplier(self.studio, self.user)
        self.client.force_authenticate(user=self.user)

    def _product_data(self, name="Sofa"):
        return {
            "name": name,
            "supplier": self.supplier.id,
            "studio": self.studio.id,
            "currency": "GBP",
            "regular_price": 500.0,
            "description": "A comfortable sofa",
        }

    def test_create_product(self):
        response = self.client.post("/library/products/", self._product_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)

    def test_list_products(self):
        create_product(self.studio, self.user, self.supplier)
        response = self.client.get("/library/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_retrieve_product(self):
        product = create_product(self.studio, self.user, name="Armchair")
        response = self.client.get(f"/library/products/{product.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Armchair")

    def test_update_product(self):
        product = create_product(self.studio, self.user)
        response = self.client.patch(f"/library/products/{product.id}/", {"name": "Updated Chair", "regular_price": 300.0}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertEqual(product.name, "Updated Chair")

    def test_delete_product(self):
        product = create_product(self.studio, self.user)
        response = self.client.delete(f"/library/products/{product.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

    def test_create_product_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/library/products/", self._product_data(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_toggle_favourite(self):
        product = create_product(self.studio, self.user)
        self.assertFalse(product.is_fav)
        response = self.client.patch(f"/library/products/{product.id}/", {"is_fav": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        product.refresh_from_db()
        self.assertTrue(product.is_fav)


# ---------------------------------------------------------------------------
# Studio Products Filter
# ---------------------------------------------------------------------------

class StudioProductsTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        create_product(self.studio, self.user, name="Table")
        create_product(self.studio, self.user, name="Lamp")
        self.client.force_authenticate(user=self.user)

    def test_get_studio_products(self):
        response = self.client.get(f"/library/studio-products/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_studio_products_filtered_by_studio(self):
        other_studio = create_studio(name="Other Studio")
        other_user = create_user(other_studio, email="other@test.com")
        create_product(other_studio, other_user, name="Other Product")

        response = self.client.get(f"/library/studio-products/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for p in response.data['results']:
            self.assertNotEqual(p.get("name"), "Other Product")

    def test_studio_products_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(f"/library/studio-products/?studio_id={self.studio.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
