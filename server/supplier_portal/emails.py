import logging

from django.conf import settings

from techstyles.email_branding import email_brand_row_html
from techstyles.resend_utils import send_studio_supplier_payment_email, send_supplier_notification_email

from .models import SupplierAccount, SupplierOrderLine

logger = logging.getLogger(__name__)


def _portal_url(path='login'):
    base = getattr(settings, 'SUPPLIER_PORTAL_URL', 'http://localhost:3003').rstrip('/')
    return f'{base}/{path.lstrip("/")}'


def _supplier_email_html(supplier: SupplierAccount, body_content: str, cta_label: str, cta_url: str) -> str:
    name = supplier.contact_name or supplier.company_name
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Focuspilot Supplier Portal</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:40px 32px;text-align:center;background-color:#111827;">
              {email_brand_row_html(align='center')}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:22px;font-weight:600;">Hello {name}</h2>
              {body_content}
              <p style="margin:24px 0 0;text-align:center;">
                <a href="{cta_url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">{cta_label}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_supplier_application_received_email(supplier: SupplierAccount) -> None:
    if not supplier.email:
        return

    portal_url = _portal_url('login')
    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        'Thanks for applying to join the Focuspilot supplier network. '
        'Our team will review your application and verify your trade account shortly.'
        '</p>'
        '<p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;">'
        'You can sign in now to start building your product catalog while we complete verification.'
        '</p>'
    )
    plain = (
        f'Hello {supplier.contact_name or supplier.company_name},\n\n'
        'Thanks for applying to join the Focuspilot supplier network. '
        'Our team will review your application shortly.\n\n'
        f'Sign in: {portal_url}\n'
    )
    html = _supplier_email_html(supplier, body, 'Open supplier portal', portal_url)
    try:
        send_supplier_notification_email(
            supplier.email,
            'Your Focuspilot supplier application was received',
            html,
            plain,
        )
    except Exception as exc:
        print(f'Error sending supplier application email to {supplier.email}: {exc}')


def send_supplier_verified_email(supplier: SupplierAccount) -> None:
    if not supplier.email:
        return

    portal_url = _portal_url('products')
    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        'Great news — your supplier account has been verified. '
        'Published products will now appear in the global catalog for design studios.'
        '</p>'
        '<p style="margin:0;color:#6b7280;font-size:15px;line-height:1.5;">'
        'Publish your catalog items to start receiving orders from studios.'
        '</p>'
    )
    plain = (
        f'Hello {supplier.contact_name or supplier.company_name},\n\n'
        'Your Focuspilot supplier account has been verified. '
        'Published products will now appear in the global catalog.\n\n'
        f'Manage products: {portal_url}\n'
    )
    html = _supplier_email_html(supplier, body, 'Manage catalog', portal_url)
    try:
        send_supplier_notification_email(
            supplier.email,
            'Your Focuspilot supplier account is verified',
            html,
            plain,
        )
    except Exception as exc:
        print(f'Error sending supplier verified email to {supplier.email}: {exc}')


def send_supplier_new_order_email(order_line: SupplierOrderLine) -> None:
    supplier = order_line.supplier
    if not supplier.email:
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    studio_name = order_line.studio.name if order_line.studio else 'Design studio'
    quantity = order_line.quantity or 1
    delivery_parts = [
        order_line.delivery_address,
        order_line.delivery_city,
        order_line.delivery_postcode,
        order_line.delivery_country,
    ]
    delivery = ', '.join(part for part in delivery_parts if part) or 'See portal for details'
    portal_url = _portal_url('orders')

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'<strong>{studio_name}</strong> added one of your catalog products to a project procurement list.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Quantity:</strong> {quantity}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Delivery:</strong> {delivery}</p>'
        '</div>'
    )
    plain = (
        f'Hello {supplier.contact_name or supplier.company_name},\n\n'
        f'{studio_name} requested your product "{product_name}" for project "{project_name}".\n'
        f'Quantity: {quantity}\n'
        f'Delivery: {delivery}\n\n'
        f'View order: {portal_url}\n'
    )
    html = _supplier_email_html(supplier, body, 'View order', portal_url)
    try:
        send_supplier_notification_email(
            supplier.email,
            f'New catalog order — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        print(f'Error sending supplier order email to {supplier.email}: {exc}')


def _studio_payment_recipient(order_line: SupplierOrderLine, paid_by_email: str | None = None) -> str | None:
    if paid_by_email:
        return paid_by_email

    procurement = getattr(order_line, 'procurement', None)
    if procurement and procurement.created_by and procurement.created_by.email:
        return procurement.created_by.email

    studio = order_line.studio
    if studio and studio.support_email:
        return studio.support_email

    if studio:
        from users.models import User

        admin = (
            User.objects.filter(studio=studio, role='admin')
            .exclude(email='')
            .order_by('id')
            .first()
        )
        if admin and admin.email:
            return admin.email

    return None


def _format_order_total(order_line: SupplierOrderLine) -> str:
    if order_line.unit_price is None:
        return '—'
    total = float(order_line.unit_price) * float(order_line.quantity or 1)
    currency = order_line.currency or 'GBP'
    return f'{currency} {total:,.2f}'


def send_supplier_payment_received_email(order_line: SupplierOrderLine) -> None:
    supplier = order_line.supplier
    if not supplier.email:
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    studio_name = order_line.studio.name if order_line.studio else 'Design studio'
    total = _format_order_total(order_line)
    portal_url = _portal_url('orders')

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'<strong>{studio_name}</strong> paid for a catalog order. The funds will be transferred to your connected Stripe account.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Amount:</strong> {total}</p>'
        '</div>'
    )
    plain = (
        f'Hello {supplier.contact_name or supplier.company_name},\n\n'
        f'{studio_name} paid for "{product_name}" on project "{project_name}".\n'
        f'Amount: {total}\n\n'
        f'View orders: {portal_url}\n'
    )
    html = _supplier_email_html(supplier, body, 'View orders', portal_url)
    try:
        send_supplier_notification_email(
            supplier.email,
            f'Payment received — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        logger.exception('Error sending supplier payment email to %s', supplier.email, exc_info=exc)


def send_studio_supplier_payment_confirmation_email(
    order_line: SupplierOrderLine,
    *,
    paid_by_email: str | None = None,
) -> None:
    recipient = _studio_payment_recipient(order_line, paid_by_email)
    if not recipient:
        logger.warning(
            'No studio recipient for supplier payment confirmation on order line %s',
            order_line.id,
        )
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    supplier_name = order_line.supplier.company_name if order_line.supplier else 'Supplier'
    total = _format_order_total(order_line)
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    project_id = order_line.project_id or ''
    procurement_url = f'{frontend}/projects/{project_id}/procurement?supplier_paid=1'

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'Your payment to <strong>{supplier_name}</strong> was successful.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Amount:</strong> {total}</p>'
        '</div>'
    )
    plain = (
        f'Your payment to {supplier_name} was successful.\n\n'
        f'Product: {product_name}\n'
        f'Project: {project_name}\n'
        f'Amount: {total}\n\n'
        f'View procurement: {procurement_url}\n'
    )
    html = f"""
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
    {email_brand_row_html(align='left')}
    <h2 style="margin:24px 0 16px;color:#111827;font-size:22px;">Payment confirmed</h2>
    {body}
    <p style="margin:24px 0 0;">
      <a href="{procurement_url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View procurement</a>
    </p>
  </div>
</body>
</html>
"""
    try:
        send_studio_supplier_payment_email(
            recipient,
            f'Supplier payment confirmed — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        logger.exception(
            'Error sending studio payment confirmation to %s',
            recipient,
            exc_info=exc,
        )


ORDER_STATUS_LABELS = {
    'RQ': 'Requested',
    'CF': 'Confirmed',
    'SH': 'Shipped',
    'DL': 'Delivered',
    'CN': 'Cancelled',
}


def _studio_procurement_url(order_line: SupplierOrderLine) -> str:
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    project_id = order_line.project_id or ''
    return f'{frontend}/projects/{project_id}/procurement'


def send_studio_supplier_order_status_email(
    order_line: SupplierOrderLine,
    *,
    previous_status: str,
) -> None:
    if order_line.status not in {'SH', 'DL', 'CN'}:
        return

    recipient = _studio_payment_recipient(order_line)
    if not recipient:
        logger.warning('No studio recipient for order status update on line %s', order_line.id)
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    supplier_name = order_line.supplier.company_name if order_line.supplier else 'Supplier'
    status_label = ORDER_STATUS_LABELS.get(order_line.status, order_line.status)
    procurement_url = _studio_procurement_url(order_line)

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'<strong>{supplier_name}</strong> updated a catalog order to <strong>{status_label}</strong>.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Status:</strong> {status_label}</p>'
        '</div>'
    )
    if order_line.notes:
        body += (
            f'<p style="margin:16px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">'
            f'<strong>Supplier notes:</strong> {order_line.notes}</p>'
        )

    plain = (
        f'{supplier_name} updated a catalog order to {status_label}.\n\n'
        f'Product: {product_name}\n'
        f'Project: {project_name}\n'
        f'Previous status: {ORDER_STATUS_LABELS.get(previous_status, previous_status)}\n'
        f'New status: {status_label}\n'
    )
    if order_line.notes:
        plain += f'\nSupplier notes: {order_line.notes}\n'
    plain += f'\nView procurement: {procurement_url}\n'

    html = f"""
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
    {email_brand_row_html(align='left')}
    <h2 style="margin:24px 0 16px;color:#111827;font-size:22px;">Supplier order update</h2>
    {body}
    <p style="margin:24px 0 0;">
      <a href="{procurement_url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">View procurement</a>
    </p>
  </div>
</body>
</html>
"""
    try:
        send_studio_supplier_payment_email(
            recipient,
            f'Supplier order {status_label.lower()} — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        logger.exception('Error sending studio order status email to %s', recipient, exc_info=exc)


def send_supplier_quote_request_email(order_line: SupplierOrderLine, *, message: str = '') -> None:
    supplier = order_line.supplier
    if not supplier.email:
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    studio_name = order_line.studio.name if order_line.studio else 'Design studio'
    quantity = order_line.quantity or 1
    portal_url = _portal_url('orders')

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'<strong>{studio_name}</strong> requested a trade quote before ordering.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Quantity:</strong> {quantity}</p>'
        '</div>'
    )
    if message:
        body += (
            f'<p style="margin:16px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">'
            f'<strong>Studio message:</strong> {message}</p>'
        )

    plain = (
        f'Hello {supplier.contact_name or supplier.company_name},\n\n'
        f'{studio_name} requested a quote for "{product_name}" on project "{project_name}".\n'
        f'Quantity: {quantity}\n'
    )
    if message:
        plain += f'\nStudio message: {message}\n'
    plain += f'\nSubmit your quote: {portal_url}\n'

    html = _supplier_email_html(supplier, body, 'Submit quote', portal_url)
    try:
        send_supplier_notification_email(
            supplier.email,
            f'Quote requested — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        logger.exception('Error sending supplier quote request email to %s', supplier.email, exc_info=exc)


def send_studio_quote_received_email(order_line: SupplierOrderLine) -> None:
    recipient = _studio_payment_recipient(order_line)
    if not recipient:
        return

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Product'
    project_name = order_line.project.project_name if order_line.project else 'Project'
    supplier_name = order_line.supplier.company_name if order_line.supplier else 'Supplier'
    total = _format_order_total(order_line)
    procurement_url = _studio_procurement_url(order_line)
    lead_time = (
        f'{order_line.quoted_lead_time_days} days'
        if order_line.quoted_lead_time_days is not None
        else 'Not specified'
    )

    body = (
        '<p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5;">'
        f'<strong>{supplier_name}</strong> submitted a quote for your catalog procurement item.'
        '</p>'
        '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Product:</strong> {product_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Project:</strong> {project_name}</p>'
        f'<p style="margin:0 0 12px;color:#374151;font-size:14px;"><strong>Quoted total:</strong> {total}</p>'
        f'<p style="margin:0;color:#374151;font-size:14px;"><strong>Lead time:</strong> {lead_time}</p>'
        '</div>'
    )
    if order_line.quote_notes:
        body += (
            f'<p style="margin:16px 0 0;color:#6b7280;font-size:14px;line-height:1.5;">'
            f'<strong>Supplier notes:</strong> {order_line.quote_notes}</p>'
        )

    plain = (
        f'{supplier_name} submitted a quote.\n\n'
        f'Product: {product_name}\n'
        f'Project: {project_name}\n'
        f'Quoted total: {total}\n'
        f'Lead time: {lead_time}\n'
    )
    if order_line.quote_notes:
        plain += f'\nSupplier notes: {order_line.quote_notes}\n'
    plain += f'\nReview procurement: {procurement_url}\n'

    html = f"""
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
    {email_brand_row_html(align='left')}
    <h2 style="margin:24px 0 16px;color:#111827;font-size:22px;">Supplier quote received</h2>
    {body}
    <p style="margin:24px 0 0;">
      <a href="{procurement_url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">Review procurement</a>
    </p>
  </div>
</body>
</html>
"""
    try:
        send_studio_supplier_payment_email(
            recipient,
            f'Quote received — {product_name}',
            html,
            plain,
        )
    except Exception as exc:
        logger.exception('Error sending studio quote received email to %s', recipient, exc_info=exc)
