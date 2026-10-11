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

import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
} from "framer-motion";

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
      return "bg-[#E8F5EC] text-[#1E6B32]";

    case "PENDING_PAYMENT":
      return "bg-[#FFF4DB] text-[#8A5A00]";

    case "PAYMENT_DECLINED":
    case "PAYMENT_VOIDED":
    case "PAYMENT_ERROR":
      return "bg-[#FDECEA] text-[#B00012]";

    default:
      return "bg-black/[0.06] text-[#6E6E73]";
  }
};

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/*  ink       #1D1D1F  primary text / primary button                          */
/*  muted     #6E6E73  secondary text                                         */
/*  surface   #F5F5F7  grouped background / field fill                        */
/*  accent-tx #96600F  brand text (AA on white and on surface)                */
/* -------------------------------------------------------------------------- */

const FONT_STACK = `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif`;

/* Critically damped springs: nothing here carries momentum, so nothing
   overshoots. They retarget from the live value, so every motion can be
   interrupted without a jump. */
const PRESS_SPRING: Transition = { type: "spring", bounce: 0, duration: 0.3 };

const SETTLE_SPRING: Transition = { type: "spring", bounce: 0, duration: 0.45 };

/* Press feedback begins on pointer-down and is reversible mid-press. */
const PRESS = {
  whileTap: { scale: 0.97 },
  transition: PRESS_SPRING,
} as const;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96600F]";

const BTN_BASE = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

const BTN_PRIMARY = "bg-[#1D1D1F] text-white hover:bg-[#3A3A3C]";

const BTN_SECONDARY = "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10";

/* 16px field text so iOS never zooms on focus. */
const INPUT_CLS =
  "h-12 w-full rounded-xl bg-[#F5F5F7] text-base tracking-[-0.005em] text-[#1D1D1F] outline-none transition-shadow duration-200 placeholder:text-[#8E8E93] focus:ring-2 focus:ring-[#96600F]";

const CARD_CLS = "rounded-[28px] bg-white";

const CAPTION_CLS =
  "text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]";
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
      // Reduced motion: transforms are dropped, opacity fades are kept.
      <MotionConfig reducedMotion="user">
        <div
          className="min-h-screen bg-[#F5F5F7] px-6 py-16 text-[#1D1D1F] antialiased [font-optical-sizing:auto]"
          style={{ fontFamily: FONT_STACK }}
        >
          <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
            <div className={`w-full overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.08)] ${CARD_CLS}`}>
              <div className="px-8 pb-6 pt-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#C98A2E]/15 text-[#96600F]">
                  <Package className="h-7 w-7" aria-hidden="true" />
                </div>

                <div className="mt-6 text-[0.9375rem] font-semibold leading-snug text-[#96600F]">
                  Administración
                </div>

                <h1 className="mt-1 text-[clamp(2.25rem,6vw,3rem)] font-semibold leading-[1.06] tracking-[-0.028em]">
                  Tus pedidos
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-[1.0625rem] leading-[1.47] text-[#6E6E73]">
                  Accede al panel privado
                  para consultar las
                  compras recibidas.
                </p>
              </div>

              <div className="px-7 pb-8">
                <label className={`block ${CAPTION_CLS}`}>
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
                  className={`mt-2 px-4 ${INPUT_CLS}`}
                />

                {error && (
                  <p
                    role="alert"
                    className="mt-3 text-[0.9375rem] text-[#B00012]"
                  >
                    {error}
                  </p>
                )}

                <motion.button
                  type="button"
                  onClick={login}
                  {...PRESS}
                  className={`mt-5 min-h-12 w-full px-6 text-[1.0625rem] ${BTN_BASE} ${BTN_PRIMARY}`}
                >
                  Entrar al panel
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </MotionConfig>
    );
  }

  return (
    // Reduced motion: transforms are dropped, opacity fades are kept.
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased [font-optical-sizing:auto]"
        style={{ fontFamily: FONT_STACK }}
      >
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[1.0625rem] font-semibold leading-snug text-[#96600F]">
                Administración
              </div>

              <h1 className="mt-1 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.028em]">
                Pedidos
              </h1>

              <p className="mt-3 text-[1.0625rem] leading-[1.47] text-[#6E6E73]">
                Consulta y revisa las
                compras recibidas.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                onClick={loadOrders}
                disabled={loading}
                whileTap={loading ? undefined : PRESS.whileTap}
                transition={PRESS_SPRING}
                className={`min-h-11 px-5 text-[0.9375rem] ${BTN_BASE} ${BTN_SECONDARY}`}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}

                Actualizar
              </motion.button>

              <motion.button
                type="button"
                onClick={logout}
                {...PRESS}
                className={`min-h-11 px-5 text-[0.9375rem] ${BTN_BASE} ${BTN_SECONDARY}`}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Salir
              </motion.button>
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

          <div className={`mt-8 p-4 sm:p-5 ${CARD_CLS}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6E73]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Buscar pedido, cliente, correo, referencia..."
                  className={`pl-11 pr-4 ${INPUT_CLS}`}
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
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFilter(
                          value
                        )
                      }
                      {...PRESS}
                      className={[
                        `min-h-11 rounded-full px-5 text-[0.9375rem] font-medium tracking-[-0.005em] transition-colors duration-200 ${FOCUS}`,
                        filter === value
                          ? "bg-[#1D1D1F] text-white"
                          : "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/10",
                      ].join(" ")}
                    >
                      {label}
                    </motion.button>
                  )
                )}
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl bg-[#FDECEA] px-5 py-4 text-[0.9375rem] leading-snug text-[#B00012]"
            >
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {loading &&
              orders.length === 0 && (
                <div className={`flex items-center justify-center py-20 ${CARD_CLS}`}>
                  <Loader2
                    className="h-7 w-7 animate-spin text-[#6E6E73]"
                    aria-hidden="true"
                  />
                </div>
              )}

            {!loading &&
              filteredOrders.length ===
                0 && (
                <div className={`px-6 py-16 text-center ${CARD_CLS}`}>
                  <Package
                    className="mx-auto h-8 w-8 text-[#96600F]"
                    aria-hidden="true"
                  />

                  <h2 className="mt-4 text-[1.375rem] font-semibold leading-[1.15] tracking-[-0.015em]">
                    No encontramos pedidos
                  </h2>

                  <p className="mt-2 text-[1.0625rem] leading-[1.47] text-[#6E6E73]">
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
                    className={`overflow-hidden ${CARD_CLS}`}
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
                      aria-expanded={isOpen}
                      className={`block w-full p-5 text-left transition-colors duration-100 active:bg-black/[0.03] sm:p-6 ${FOCUS}`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[0.8125rem] font-medium tracking-[0.01em] ${getStatusClasses(
                                order.status
                              )}`}
                            >
                              {statusLabel(
                                order.status
                              )}
                            </span>

                            <span className={CAPTION_CLS}>
                              {formatDate(
                                order.createdAt
                              )}
                            </span>
                          </div>

                          <h2 className="mt-3 truncate text-xl font-semibold leading-[1.2] tracking-[-0.015em]">
                            {order.product
                              ?.title ||
                              "Producto"}
                          </h2>

                          <div className="mt-1 text-[0.9375rem] text-[#6E6E73]">
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
                            <div className={CAPTION_CLS}>
                              Pedido
                            </div>

                            <div className="mt-1 max-w-[220px] break-all text-[0.9375rem] font-semibold">
                              {order.orderId}
                            </div>
                          </div>

                          <div>
                            <div className={CAPTION_CLS}>
                              Total
                            </div>

                            <div className="mt-1 text-xl font-semibold tracking-[-0.015em] tabular-nums">
                              {formatMoney(
                                order.amountInCents,
                                order.currency
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            height: SETTLE_SPRING,
                            opacity: { duration: 0.25, ease: "easeOut" },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-6 pt-1 sm:px-6">
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

                            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#F5F5F7] p-5 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className={CAPTION_CLS}>
                                  Última actualización
                                </div>

                                <div className="mt-1 text-[0.9375rem] font-semibold">
                                  {formatDate(
                                    order.updatedAt
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {order.status ===
                                  "PAID" && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5EC] px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] text-[#1E6B32]">
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                    Pago confirmado
                                  </span>
                                )}

                                {order.fulfillment
                                  ?.productionStatus && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]">
                                    <Package className="h-4 w-4" aria-hidden="true" />
                                    {
                                      order
                                        .fulfillment
                                        .productionStatus
                                    }
                                  </span>
                                )}

                                {order.fulfillment
                                  ?.shippingStatus && (
                                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] text-[#6E6E73]">
                                    <Truck className="h-4 w-4" aria-hidden="true" />
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
            )}
          </div>
        </main>
      </div>
    </MotionConfig>
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
    <div className={`p-6 ${CARD_CLS}`}>
      <div className={CAPTION_CLS}>
        {label}
      </div>

      <div className="mt-2 text-4xl font-semibold leading-none tracking-[-0.025em] tabular-nums">
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
    <div className="rounded-2xl bg-[#F5F5F7] p-5">
      <h3 className="text-[1.0625rem] font-semibold tracking-[-0.01em]">
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
      <div className={CAPTION_CLS}>
        {label}
      </div>

      <div className="mt-0.5 break-all text-[0.9375rem] text-[#1D1D1F]">
        {value || "—"}
      </div>
    </div>
  );
}