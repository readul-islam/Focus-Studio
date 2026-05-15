from rest_framework import status
from rest_framework.test import APITestCase
from users.models import Studio, User
from .models import Comments


def create_studio(name="Comment Studio"):
    return Studio.objects.create(name=name)


def create_user(studio, email="comment@example.com", role="admin"):
    user = User.objects.create_user(email=email, password="pass1234!")
    user.name = "Comment User"
    user.studio = studio
    user.role = role
    user.save()
    return user


class CommentTest(APITestCase):
    def setUp(self):
        self.studio = create_studio()
        self.user = create_user(self.studio)
        self.client.force_authenticate(user=self.user)

    def test_create_comment(self):
        data = {"text": "This is a comment", "studio": self.studio.id}
        response = self.client.post("/comment/comments/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comments.objects.count(), 1)

    def test_list_comments(self):
        Comments.objects.create(text="First comment", studio=self.studio, user=self.user)
        response = self.client.get("/comment/comments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_comment(self):
        comment = Comments.objects.create(text="Retrieve me", studio=self.studio, user=self.user)
        response = self.client.get(f"/comment/comments/{comment.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["text"], "Retrieve me")

    def test_update_comment(self):
        comment = Comments.objects.create(text="Original text", studio=self.studio, user=self.user)
        response = self.client.patch(f"/comment/comments/{comment.id}/", {"text": "Updated text"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment.refresh_from_db()
        self.assertEqual(comment.text, "Updated text")

    def test_delete_comment(self):
        comment = Comments.objects.create(text="Delete me", studio=self.studio, user=self.user)
        response = self.client.delete(f"/comment/comments/{comment.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comments.objects.count(), 0)

    def test_create_comment_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/comment/comments/", {"text": "Unauthorized"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_comments_ordered_newest_first(self):
        Comments.objects.create(text="First", studio=self.studio, user=self.user)
        Comments.objects.create(text="Second", studio=self.studio, user=self.user)
        response = self.client.get("/comment/comments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        texts = [c["text"] for c in response.data]
        self.assertEqual(texts[0], "Second")
