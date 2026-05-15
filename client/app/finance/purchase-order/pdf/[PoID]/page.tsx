'use client';
import React, { useEffect } from 'react';
import { Loader, Truck } from 'lucide-react';
import logo from '/public/studio.jpeg';
import placeHolder from '/public/product-placeholder-wp.jpg';
import Image from 'next/image';
import useFetch from '@/hooks/useFetch';
import { useCurrency } from '@/lib/getCurrencySymbol';

// Main Purchase Order Component
const PurchaseOrder = ({ params }) => {
  const id = params.PoID;
  
  // Fetch purchase order data from API
  const { data, isLoading, isError, error } = useFetch(`/finance/purchase-orders/${id}/download/`);
  const {currency} = useCurrency(data?.currency)

  // Auto-print when data is loaded and auto-close after print/cancel
  useEffect(() => {
    if (data && !isLoading && !isError) {
      // Set page title to PO number
      if (data?.display_po) {
        document.title = data?.project?.project_name + " - " + data.display_po;
      }

      // Small delay to ensure the page is fully rendered before printing
      const printTimeout = setTimeout(() => {
        window.print();
      }, 1000);

      // Multiple approaches for auto-close to ensure reliability across browsers
      const handleAfterPrint = () => {
        setTimeout(() => {
          window.close();
        }, 100);
      };

      // Method 1: afterprint event
      window.addEventListener('afterprint', handleAfterPrint);

      // Method 2: Media query change detection (more reliable fallback)
      const printMediaQuery = window.matchMedia('print');
      const handleMediaChange = (e: MediaQueryListEvent) => {
        if (!e.matches) {
          // Print media query is no longer active, meaning print dialog was closed
          setTimeout(() => {
            window.close();
          }, 100);
        }
      };

      // For modern browsers
      if (printMediaQuery.addEventListener) {
        printMediaQuery.addEventListener('change', handleMediaChange);
      } else {
        // Fallback for older browsers
        printMediaQuery.addListener(handleMediaChange);
      }

      return () => {
        clearTimeout(printTimeout);
        window.removeEventListener('afterprint', handleAfterPrint);
        if (printMediaQuery.removeEventListener) {
          printMediaQuery.removeEventListener('change', handleMediaChange);
        } else {
          printMediaQuery.removeListener(handleMediaChange);
        }
      };
    }
  }, [data, isLoading, isError])
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2">Loading purchase order...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading purchase order</p>
          <p className="text-sm text-gray-600">{error?.message || 'Please try again later'}</p>
        </div>
      </div>
    );
  }

  const lineItems = data?.line_items || [];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      {/* Purchase Order Summary Page */}
      <div className="p-8 min-h-screen text-gray-800">
        {/* Header Section */}
        <div className="flex justify-between mb-16">
          <div className="flex-1">
            <h1 className="text-2xl font-normal mb-1 text-black">Purchase Order</h1>
            <h2 className="text-xl font-normal mb-5 text-black">#{data?.display_po}</h2>
            <div className="text-xs leading-relaxed">
              <p>Issue Date: {data?.date ? new Date(data.date).toLocaleDateString('en-GB') : '-'}</p>
              <p>Due Date: {data?.due_date ? new Date(data.due_date).toLocaleDateString('en-GB') : '-'}</p>
              <p>Supplier: {data?.supplier?.company_name}</p>
              <p>Project: {data?.project?.project_name}</p>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="text-left">
              <Image src={logo} alt="Company Logo" className="w-16 h-16 mb-2" />
              <div className="text-xs leading-relaxed">
                <p>{data?.studio?.name}</p>
                <p>11 Wilman Rd</p>
                <p>Tunbridge Wells</p>
                <p>TN4 9AJ</p>
                <p>VAT NO: GB423127335</p>
                <p>{data?.studio?.support_email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* From Section */}
        <div className="mb-6">
          <div className="text-sm leading-relaxed">
            <p>{data?.supplier?.company_name}</p>
            <p>{data?.supplier?.address}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <div className="border-b border-gray-200 mb-2">
            <div className="flex py-3 text-xs text-gray-400">
              <div className="w-1/12">IMAGE</div>
              <div className="w-3/12">DESCRIPTION</div>
              <div className="w-3/12">DIMENSIONS</div>
              <div className="w-1/12 text-center">QTY</div>
              <div className="w-2/12 text-right">PRICE</div>
              <div className="w-2/12 text-right">AMOUNT</div>
            </div>
          </div>

          {lineItems.map((item, index) => {
            const primaryImage = item.product?.images?.find(img => img.is_primary)?.image || 
                                item.product?.images?.[0]?.image;
            const unitPrice = parseFloat(item.unit_price || 0);
            const total = parseFloat(item.total || 0);
            
            return (
              <div key={item.id || index} className="flex py-3 border-b border-gray-100 text-sm items-center">
                <div className="w-1/12">
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={item.product?.name || item.description}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <Image
                      src={placeHolder}
                      alt={item.product?.name || item.description}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                </div>
                <div className="w-3/12">{item.description || item.product?.name}</div>
                <div className="w-3/12">{data?.product_details_enriched?.[index]?.product_dimensions || '-'}</div>
                <div className="w-1/12 text-center">{item.quantity}</div>
                <div className="w-2/12 text-right">
                  {currency?.symbol}
                  {unitPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="w-2/12 text-right">
                   {currency?.symbol}
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal</span>
              <span>
                {currency?.symbol}
                {data?.total_amount - data?.delivery_charge}
              </span>
            </div>

            {data?.delivery_charge > 0 && (
              <div className="flex justify-between mb-2 text-sm">
                <span>Delivery Charge</span>
                <span>
                  {currency?.symbol}
                  {data?.delivery_charge}
                </span>
              </div>
            )}

            <div className="flex justify-between font-medium text-sm border-t pt-2">
              <span>TOTAL</span>
              <span>
                {currency?.symbol}
                {data?.total_amount}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Section */}
        <div className="bg-stone-100 p-4 rounded-md mb-8 print-color-adjust">
          <div className="flex items-center mb-1">
            <Truck size={20} className="text-gray-700" />
            <span className="ml-2 font-medium text-sm">Delivery Address:</span>
          </div>
          <div className="pl-9 text-xs leading-relaxed text-gray-600">
            <p>{data?.project?.delivery_address || data?.project?.location || '-'}</p>
          </div>
        </div>
      </div>

      {/* Product Detail Pages */}
      {lineItems.map((item, index) => (
        <ProductDetailPage
          key={item.id || index}
          item={item}
          index={index}
          projectName={data?.project?.project_name}
          supplierData={data?.supplier}
          productDetails={data?.product_details_enriched?.[index]}
          currencySymbol= {currency?.symbol}
        />
      ))}
      
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage = ({ item, index, projectName, supplierData, productDetails, currencySymbol }) => {
  const primaryImage = item.product?.images?.find(img => img.is_primary)?.image || 
                      item.product?.images?.[0]?.image;
  
  return (
    <div className="p-8 text-gray-800 border-t border-gray-200 mt-8 page-break-before">
      {/* Header with project info */}
      <div className="mb-5">
        <p className="text-xs text-gray-700">{projectName || ''}</p>
      </div>

      {/* Product Type & Code Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-black">{item.product?.name || item.description}</h2>
      </div>

      {/* Product Image */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="">
          <div>
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={item.product?.name || item.description}
                className="w-[250px] h-[250px] object-contain"
              />
            ) : (
              <Image
                src={placeHolder}
                alt={item.product?.name || item.description}
                className="w-[250px] h-[250px] object-contain"
              />
            )}
          </div>
        </div>

        <div>
          {/* Product Specs Section */}
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Product Specs</h3>

            <div className="flex flex-wrap">
              {/* Left Column */}
              <div className="w-1/2">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Product Name</p>
                  <p className="text-xs font-medium">{productDetails?.product_name || item.product?.name}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Product Dimensions</p>
                  <p className="text-xs font-medium">{productDetails?.product_dimensions || '-'}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Quantity</p>
                  <p className="text-xs font-medium">{item.quantity}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                  <p className="text-xs font-medium">
                    {currencySymbol}
                    {parseFloat(item.unit_price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Contact Information</h3>

            <div className="flex flex-wrap">
              {/* Left Column */}
              <div className="w-1/2">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Supplier Name</p>
                  <p className="text-xs font-medium">{productDetails?.supplier_name || supplierData?.company_name}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Supplier Contact</p>
                  <p className="text-xs font-medium">{productDetails?.supplier_contact_person || supplierData?.name}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-xs font-medium">{productDetails?.supplier_phone || supplierData?.phone || '-'}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-1/2">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-xs font-medium">{productDetails?.supplier_email || supplierData?.email || '-'}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Supplier Address</p>
                  <p className="text-xs font-medium">{productDetails?.supplier_address || supplierData?.address || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;
