import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Loader2,
  LogOut,
  Package,
  RefreshCw,
  Search,
  Truck
} from "lucide-react";

type OrderStatus =
  | "PAID"
  | "PENDING_PAYMENT"
  | "PAYMENT_DECLINED"
  | "PAYMENT_VOIDED"
  | "PAYMENT_ERROR"
  | "PAYMENT_PENDING_REVIEW"
  | string;

type Payment = {
  provider?: string;
  status?: string;
  transactionId?: string | null;
  reference?: string;
  amountInCents?: number;
  currency?: string;
  transactionUpdatedAt?: string;
  webhookReceivedAt?: string;
  paymentMethodType?: string | null;
  statusMessage?: string | null;
  failureReason?: string | null;
};

type Customer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
};

type Product = {
  id?: number;
  title?: string;
  quantity?: number;
  unitPrice?: number;
};

type Fulfillment = {
  productionStatus?: string;
  shippingStatus?: string;
};

type Order = {
  orderId: string;
  wompiReference: string;
  status: OrderStatus;
  product?: Product;
  amountInCents?: number;
  currency?: string;
  customer?: Customer;
  payment?: Payment;
  fulfillment?: Fulfillment;
  createdAt?: string;
  updatedAt?: string;
};

const API_URL =
  import.meta.env.VITE_ORDER_ADMIN_API || "";

const formatMoney = (
  amountInCents?: number,
  currency = "COP"
) => {
  if (
    typeof amountInCents !== "number"
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }
  ).format(
    amountInCents / 100
  );
};

const formatDate = (
  value?: string
) => {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const statusLabel = (
  status: string
) => {
  switch (status) {
    case "PAID":
      return "Pagado";

    case "PENDING_PAYMENT":
      return "Pendiente";

    case "PAYMENT_DECLINED":
      return "Rechazado";

    case "PAYMENT_VOIDED":
      return "Anulado";

    case "PAYMENT_ERROR":
      return "Error";

    case "PAYMENT_PENDING_REVIEW":
      return "Revisión";

    default:
      return status;
  }
};

const getStatusClasses = (
  status: string
) => {
  switch (status) {
    case "PAID":
      return "border-[#BFD8C7] bg-[#F3FAF5] text-[#3D8A5A]";

    case "PENDING_PAYMENT":
      return "border-[#E2D2A5] bg-[#FFF9E9] text-[#9A7638]";

    case "PAYMENT_DECLINED":
    case "PAYMENT_VOIDED":
    case "PAYMENT_ERROR":
      return "border-[#E6B5AE] bg-[#FFF5F2] text-[#9A4B3F]";

    default:
      return "border-[#D9D1C2] bg-white text-[#716C63]";
  }
};

export default function OrdersAdmin() {
  const [
    adminKey,
    setAdminKey,
  ] = useState(
    () =>
      sessionStorage.getItem(
        "vanguard_admin_key"
      ) || ""
  );

  const [
    keyInput,
    setKeyInput,
  ] = useState("");

  const [
    orders,
    setOrders,
  ] = useState<Order[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("ALL");

  const [
    expanded,
    setExpanded,
  ] = useState<
    string | null
  >(null);

  const loadOrders =
    async () => {
      if (!API_URL) {
        setError(
          "VITE_ORDER_ADMIN_API no está configurado."
        );
        return;
      }

      if (!adminKey) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            API_URL,
            {
              method: "GET",
              headers: {
                Accept:
                  "application/json",

                "x-admin-key":
                  adminKey,
              },

              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          if (
            response.status === 401
          ) {
            sessionStorage.removeItem(
              "vanguard_admin_key"
            );

            setAdminKey("");
            setError(
              "La clave de administrador no es válida."
            );

            return;
          }

          throw new Error(
            data?.error ||
              "No fue posible cargar los pedidos."
          );
        }

        setOrders(
          Array.isArray(
            data?.orders
          )
            ? data.orders
            : []
        );
      } catch (err) {
        console.error(
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar los pedidos."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (adminKey) {
      loadOrders();
    }
  }, [adminKey]);

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const matchesStatus =
            filter === "ALL" ||
            order.status ===
              filter;

          if (
            !matchesStatus
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            order.orderId,
            order.wompiReference,
            order.product?.title,
            order.customer?.name,
            order.customer?.email,
            order.customer?.phone,
            order.customer?.city,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    query
                  )
            );
        }
      );
    }, [
      orders,
      search,
      filter,
    ]);

  const stats =
    useMemo(() => {
      return {
        total:
          orders.length,

        paid:
          orders.filter(
            (order) =>
              order.status ===
              "PAID"
          ).length,

        pending:
          orders.filter(
            (order) =>
              order.status ===
              "PENDING_PAYMENT"
          ).length,

        declined:
          orders.filter(
            (order) =>
              order.status ===
              "PAYMENT_DECLINED"
          ).length,
      };
    }, [orders]);

  const login = () => {
    const value =
      keyInput.trim();

    if (!value) {
      return;
    }

    sessionStorage.setItem(
      "vanguard_admin_key",
      value
    );

    setAdminKey(value);
    setKeyInput("");
  };

  const logout = () => {
    sessionStorage.removeItem(
      "vanguard_admin_key"
    );

    setAdminKey("");
    setOrders([]);
    setExpanded(null);
  };

  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] px-6 py-16 text-[#171512]">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
          <div className="w-full overflow-hidden rounded-[2rem] border border-[#D9D1C2] bg-[#F8F5EF] shadow-[0_35px_100px_rgba(34,29,20,0.14)]">
            <div className="bg-[#171512] px-8 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.07]">
                <Package className="h-7 w-7 text-[#F6D79D]" />
              </div>

              <div className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#D7A451]">
                Administración
              </div>

              <h1
                className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#F7F5EF]"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                Tus pedidos
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#CBC7BF]">
                Accede al panel privado
                para consultar las
                compras recibidas.
              </p>
            </div>

            <div className="p-7">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9388]">
                Clave de administrador
              </label>

              <input
                type="password"
                value={keyInput}
                onChange={(event) =>
                  setKeyInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    login();
                  }
                }}
                placeholder="Ingresa tu clave"
                className="mt-3 h-12 w-full rounded-xl border border-[#D9D1C2] bg-white px-4 text-sm outline-none transition focus:border-[#D7A451]"
              />

              {error && (
                <p className="mt-3 text-sm text-[#9A4B3F]">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={login}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#171512] px-6 text-sm font-bold text-white transition hover:bg-[#D7A451] hover:text-[#171512]"
              >
                Entrar al panel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#171512]">
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#AE8243]">
              Administración
            </div>

            <h1
              className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl"
              style={{
                fontFamily:
                  "var(--font-display)",
              }}
            >
              Pedidos
            </h1>

            <p className="mt-3 text-sm text-[#716C63]">
              Consulta y revisa las
              compras recibidas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-5 text-sm font-bold text-[#171512] transition hover:bg-[#ECE7DE] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              Actualizar
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-5 text-sm font-bold text-[#716C63] transition hover:bg-[#ECE7DE]"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pedidos"
            value={stats.total}
          />

          <StatCard
            label="Pagados"
            value={stats.paid}
          />

          <StatCard
            label="Pendientes"
            value={stats.pending}
          />

          <StatCard
            label="Rechazados"
            value={stats.declined}
          />
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[#D9D1C2] bg-[#F8F5EF] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9388]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar pedido, cliente, correo, referencia..."
                className="h-12 w-full rounded-xl border border-[#D9D1C2] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D7A451]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["ALL", "Todos"],
                ["PAID", "Pagados"],
                [
                  "PENDING_PAYMENT",
                  "Pendientes",
                ],
                [
                  "PAYMENT_DECLINED",
                  "Rechazados",
                ],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        value
                      )
                    }
                    className={[
                      "h-10 rounded-full px-4 text-xs font-bold transition",
                      filter === value
                        ? "bg-[#171512] text-white"
                        : "border border-[#D9D1C2] bg-white text-[#716C63] hover:bg-[#ECE7DE]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#E6B5AE] bg-[#FFF5F2] px-5 py-4 text-sm text-[#9A4B3F]">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {loading &&
            orders.length === 0 && (
              <div className="flex items-center justify-center rounded-[1.75rem] border border-[#D9D1C2] bg-[#F8F5EF] py-20">
                <Loader2 className="h-7 w-7 animate-spin text-[#AE8243]" />
              </div>
            )}

          {!loading &&
            filteredOrders.length ===
              0 && (
              <div className="rounded-[1.75rem] border border-[#D9D1C2] bg-[#F8F5EF] px-6 py-16 text-center">
                <Package className="mx-auto h-8 w-8 text-[#AE8243]" />

                <h2 className="mt-4 text-lg font-bold">
                  No encontramos pedidos
                </h2>

                <p className="mt-2 text-sm text-[#716C63]">
                  Prueba otra búsqueda
                  o cambia el filtro.
                </p>
              </div>
            )}

          {filteredOrders.map(
            (order) => {
              const isOpen =
                expanded ===
                order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="overflow-hidden rounded-[1.75rem] border border-[#D9D1C2] bg-[#F8F5EF] shadow-[0_15px_50px_rgba(34,29,20,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        isOpen
                          ? null
                          : order.orderId
                      )
                    }
                    className="block w-full p-5 text-left sm:p-6"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${getStatusClasses(
                              order.status
                            )}`}
                          >
                            {statusLabel(
                              order.status
                            )}
                          </span>

                          <span className="text-xs text-[#9A9388]">
                            {formatDate(
                              order.createdAt
                            )}
                          </span>
                        </div>

                        <h2 className="mt-3 truncate text-lg font-black">
                          {order.product
                            ?.title ||
                            "Producto"}
                        </h2>

                        <div className="mt-1 text-xs text-[#716C63]">
                          {order.customer
                            ?.name ||
                            "Cliente"}{" "}
                          ·{" "}
                          {order.customer
                            ?.city ||
                            "Sin ciudad"}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A9388]">
                            Pedido
                          </div>

                          <div className="mt-1 max-w-[220px] break-all text-sm font-semibold">
                            {order.orderId}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A9388]">
                            Total
                          </div>

                          <div className="mt-1 text-base font-black">
                            {formatMoney(
                              order.amountInCents,
                              order.currency
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#D9D1C2] px-5 pb-6 pt-5 sm:px-6">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <DetailCard title="Cliente">
                          <DetailRow
                            label="Nombre"
                            value={
                              order.customer
                                ?.name
                            }
                          />

                          <DetailRow
                            label="Correo"
                            value={
                              order.customer
                                ?.email
                            }
                          />

                          <DetailRow
                            label="Teléfono"
                            value={
                              order.customer
                                ?.phone
                            }
                          />

                          <DetailRow
                            label="Dirección"
                            value={
                              order.customer
                                ?.address
                            }
                          />

                          <DetailRow
                            label="Ciudad"
                            value={
                              order.customer
                                ?.city
                            }
                          />

                          <DetailRow
                            label="Departamento"
                            value={
                              order.customer
                                ?.region
                            }
                          />
                        </DetailCard>

                        <DetailCard title="Pago">
                          <DetailRow
                            label="Referencia"
                            value={
                              order.wompiReference
                            }
                          />

                          <DetailRow
                            label="Transacción"
                            value={
                              order.payment
                                ?.transactionId
                            }
                          />

                          <DetailRow
                            label="Estado Wompi"
                            value={
                              order.payment
                                ?.status
                            }
                          />

                          <DetailRow
                            label="Método"
                            value={
                              order.payment
                                ?.paymentMethodType
                            }
                          />

                          <DetailRow
                            label="Monto"
                            value={formatMoney(
                              order.payment
                                ?.amountInCents,
                              order.payment
                                ?.currency ||
                                order.currency
                            )}
                          />
                        </DetailCard>

                        <DetailCard title="Logística">
                          <DetailRow
                            label="Producto"
                            value={
                              order.product
                                ?.title
                            }
                          />

                          <DetailRow
                            label="Cantidad"
                            value={String(
                              order.product
                                ?.quantity ??
                                1
                            )}
                          />

                          <DetailRow
                            label="Producción"
                            value={
                              order.fulfillment
                                ?.productionStatus
                            }
                          />

                          <DetailRow
                            label="Envío"
                            value={
                              order.fulfillment
                                ?.shippingStatus
                            }
                          />

                          <DetailRow
                            label="Creado"
                            value={formatDate(
                              order.createdAt
                            )}
                          />
                        </DetailCard>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#D9D1C2] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A9388]">
                            Última actualización
                          </div>

                          <div className="mt-1 text-sm font-semibold">
                            {formatDate(
                              order.updatedAt
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status ===
                            "PAID" && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFD8C7] bg-[#F3FAF5] px-4 py-2 text-xs font-bold text-[#3D8A5A]">
                              <Check className="h-4 w-4" />
                              Pago confirmado
                            </span>
                          )}

                          {order.fulfillment
                            ?.productionStatus && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-4 py-2 text-xs font-bold text-[#716C63]">
                              <Package className="h-4 w-4" />
                              {
                                order
                                  .fulfillment
                                  .productionStatus
                              }
                            </span>
                          )}

                          {order.fulfillment
                            ?.shippingStatus && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C2] bg-white px-4 py-2 text-xs font-bold text-[#716C63]">
                              <Truck className="h-4 w-4" />
                              {
                                order
                                  .fulfillment
                                  .shippingStatus
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#D9D1C2] bg-[#F8F5EF] p-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A9388]">
        {label}
      </div>

      <div className="mt-2 text-3xl font-black tracking-[-0.04em]">
        {value}
      </div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#D9D1C2] bg-white p-5">
      <h3 className="text-sm font-black">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9A9388]">
        {label}
      </div>

      <div className="mt-1 break-all text-sm text-[#4D4942]">
        {value || "—"}
      </div>
    </div>
  );
}