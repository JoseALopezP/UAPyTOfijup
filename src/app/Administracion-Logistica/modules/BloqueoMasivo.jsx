'use client'
import { useState } from 'react'

// ── Datos estáticos ───────────────────────────────────────────────────────────
const TIPOS_PERSONA = [
    { value: 'juez', label: 'Juez' },
    { value: 'fiscal', label: 'Fiscal' },
    { value: 'defensor', label: 'Defensor' },
    { value: 'psicologo_gesell', label: 'Psicóloga/o Cámara Gesell' },
]

const JUECES = [
    { value: "5cdb154a-1c9b-43b4-af97-ac5f7a5340fd", label: "ADARVEZ, MARIO GUILLERMO" },
    { value: "fc156f9b-79b9-4ee7-ba43-97e2cde6dc74", label: "AGUILERA, VICTORIA BELEN" },
    { value: "1fd6624f-a79f-4f13-8d05-8094fac03cfc", label: "ALLENDE, FLAVIA GABRIELA" },
    { value: "c954ce5c-d7c5-469a-a3d8-6e825d827663", label: "BARBERA, EUGENIO MAXIMILIANO" },
    { value: "a308cb1b-af9a-469b-9647-613349e8e922", label: "BLEJMAN, MAXIMILIANO" },
    { value: "b539ee47-50bc-4d2d-a24e-dfb897240521", label: "BUENO, JUAN BAUTISTA" },
    { value: "0619f034-90af-4338-8780-6c9366cfc7a6", label: "CABALLERO, RAMÓN ALBERTO" },
    { value: "b00516a2-a6c5-4caf-801d-db8221c727e2", label: "CABALLERO VIDAL, JUAN CARLOS" },
    { value: "bf999ab3-09c0-4e42-98a5-35b6045cc1cd", label: "CARRERA PEDROTTI, MARIANO DANIEL" },
    { value: "7d990c48-df92-45b5-baf7-580f04642e8a", label: "CASTRO, DOMINGO DANIEL" },
    { value: "cfa416db-051b-455f-b9eb-a3aebf74385a", label: "CHICON, GLORIA VERÓNICA" },
    { value: "7423c846-66f0-417a-91f3-f58a8be49522", label: "CORREA PATIÑO, BENEDICTO WALTER" },
    { value: "b4acc711-e888-4477-a6a5-35cbe91f94af", label: "DAVILA SAFFE, MIGUEL ANGEL" },
    { value: "72867559-2439-436a-b734-8e3e76619fd6", label: "DE SANCTIS, GUILLERMO HORACIO" },
    { value: "f9f7c796-9713-44ef-982b-6e10292a03fc", label: "ECHEGARAY (JUEZ), FERNANDO RAMON" },
    { value: "eb77649b-1807-43a6-a17c-df73a249722d", label: "FERNANDEZ CAUSSI, GERARDO JAVIER" },
    { value: "0f4b01b7-081b-4da1-88d3-1c80b8b32a31", label: "FIGUEROLA, RODOLFO JAVIER" },
    { value: "2214d201-361e-453a-b4f4-ac96235d7a3f", label: "GARCIA NIETO, ADRIANA VERONICA" },
    { value: "608b0486-cdad-4d43-bc6a-13857eb044b9", label: "GROSSI, RICARDO ANIBAL" },
    { value: "583bfbe1-62aa-4b27-9fb5-fc46b834b547", label: "GUERRERO, MARIA GEMA" },
    { value: "c2baae9d-1dbe-43a8-84d2-dddf40e65aa1", label: "GUILLEN ALONSO, FABIO DANIEL" },
    { value: "9fb51a3f-e0cc-4680-aabb-309f7c783979", label: "HEREDIA ZALDO, MARTIN" },
    { value: "18e75f33-409c-4dc3-a076-26b0355ebb1c", label: "LAGE, MIGUEL ALEJANDRO" },
    { value: "ebf1ae29-1e6e-40bd-af5e-cd04c8223c2f", label: "LARREA, ANA LIA" },
    { value: "e0c00598-3153-4d7e-a03b-7be70db9961e", label: "LEON, PABLO LEONARDO" },
    { value: "82ee863e-a749-4a08-b9f8-6f67eafb5e08", label: "LIMA, CARLOS ALBERTO" },
    { value: "e08e0dd0-debd-47a5-9309-1b26965cbf38", label: "LIMA, MARCELO JORGE" },
    { value: "7ae6a2ce-8a69-4dd0-adb8-e73d125dfc93", label: "LOPEZ MARTI, SERGIO" },
    { value: "74bc10f5-181d-4dd1-95f1-fb529ecd910c", label: "LUCERO, MONICA" },
    { value: "f1415c0e-df2f-4ec5-bd1a-9b0b057ff41f", label: "MALDONADO DE ALVAREZ, CELIA" },
    { value: "3c046e92-78de-460e-b388-c0170776264c", label: "MEGLIOLI, JUAN GABRIEL" },
    { value: "8898fd62-4025-4998-901d-9833033433f1", label: "MOINE, RICARDO ESTEBAN" },
    { value: "1bafe788-09e2-4400-aa0c-8203d9639488", label: "MONTILLA, ROBERTO JORGE" },
    { value: "b6d3a23c-6c2d-4211-bcd7-f02ed6153c44", label: "MOYA, MABEL IRENE" },
    { value: "6f2fda4d-1870-4e9c-a19b-d9bffd584584", label: "MUÑOZ CARPINO, VICTOR HUGO" },
    { value: "e1a558d7-8e00-4b83-8bcc-884902b601cf", label: "OLIVARES YAPUR, DANIEL GUSTAVO" },
    { value: "dff5efdb-bbef-4ec7-b9fa-ca0e822f2cf2", label: "PALACIO, FEDERICO RAMON" },
    { value: "48c86072-79f4-4a01-88b1-e9ed025e740a", label: "PARRA, ANA CAROLINA" },
    { value: "e42da519-f5c9-42f5-881d-8f5220686624", label: "PARRON, MATIAS FRANCISCO" },
    { value: "ec778f44-3c12-467b-a04d-367eb554f256", label: "PEÑAFORT, MARTIN ENRIQUE" },
    { value: "e82ed61c-7ed2-42eb-a05f-3fc312fa198a", label: "QUIROGA, HUGO MARCOS" },
    { value: "0ab796b3-7537-47c0-b1f4-5a138491df53", label: "RAED, EDUARDO OSCAR" },
    { value: "60bf271c-f8bb-43ae-8d77-e8eb7ad1c728", label: "REVERENDO, LIDIA" },
    { value: "93be1c4a-b772-4fde-ad3b-fb696233f967", label: "ROCA, RENATO DARIO" },
    { value: "e8a07e1e-cbcf-474a-9d25-d40fe5b55d40", label: "RODRIGUEZ, FEDERICO MARCELO" },
    { value: "8a4ebd8d-d52e-48ac-a61a-94d07d663dc5", label: "ROSSO, MARIA SILVINA" },
    { value: "a47033bd-65dc-4da8-8207-6b9b7665e432", label: "SANZ, DIEGO MANUEL" },
    { value: "cf3b3c43-bc01-4487-b9f5-0f1cf0bdedd0", label: "VEGA, EDUARDO JESUS" },
    { value: "f4809669-8b17-48a3-8b78-868839d18ddf", label: "VICTORIA, JUAN JOSE ENRIQUE" },
    { value: "2b429315-56ed-460f-8187-97f60a7a5960", label: "ZAPATA, FEDERICO EMILIANO" },
]

const FISCALES = [
    { value: "9017c528-1c0a-4e3c-bad6-6d18378abfa9", label: "AARREDONDO MORANDO, MARIA PAULA" },
    { value: "95e8b6a6-ecce-40fe-9541-c637fe3e3c0b", label: "ABALLAY, SOHAR ALFREDO" },
    { value: "853b629d-d6b5-422c-8a93-bab58694814a", label: "ACHEM, IGNACIO ANTONIO" },
    { value: "ee2ba250-89cc-4a33-9751-c02eca02e1a2", label: "ALAMO, PABLO ARIEL" },
    { value: "792be5c4-2041-4766-bc24-65999083f90b", label: "ALBARRACIN, JORGE ENRIQUE" },
    { value: "0249b834-38bd-4a0b-ade1-5be831939b39", label: "ALONSO, ROMINA ADRIANA" },
    { value: "a5922126-af5b-4c51-87b8-4cde2b271545", label: "ALTAMIRA , ALEJANDRA" },
    { value: "5a64b88d-81b7-44d0-a0ac-d38bedece870", label: "ALVAREZ , MARCELO ALBERTO" },
    { value: "64d8adac-c6c6-431e-93de-dc65ca60a620", label: "ALVO LOPEZ, NICOLAS EDUARDO" },
    { value: "b58535ec-8453-411a-82a6-afdf38f44d40", label: "AMARFIL CORTEZ, ANA PAULA" },
    { value: "96d63a07-1b2c-45f1-93dc-9b78f2398770", label: "ARANCIBIA, LEONARDO RAUL" },
    { value: "bb244c23-52cf-4eff-b229-e7c19643a631", label: "ARCHILLA GONZALEZ, SANTIAGO GABRIEL" },
    { value: "ffd1941c-e739-40b9-a436-12edc9fc2d55", label: "ARRIEN , FRANCISCO ANIBAL" },
    { value: "3b22691a-e5a7-47b6-9c16-a8d2fcf4af5c", label: "BAIGORRI, GUILLERMO FRANCISCO" },
    { value: "29b5314a-744e-4599-b0f4-088432b0a28c", label: "BALDITARRA , GERMAN" },
    { value: "70086d44-0ed7-4899-812a-22f9cf5ad7f1", label: "BARRIENTOS, GABRIELA LILIANA" },
    { value: "f804a609-0d4c-4391-90e5-15c12b1a2884", label: "BARTOLOME , MARIA ALEJANDRA" },
    { value: "627576d6-6ea9-406f-a4ea-f193f8b6699a", label: "BAZAN, ALEJANDRA VERONICA" },
    { value: "06fd7687-5b20-40af-b74e-308c0ecc0f40", label: "BERBARI LULUAGA, MILENA" },
    { value: "a0c86a95-ebcd-403e-802f-1ba2ff3d4ddf", label: "BERRETA, ALEJANDRO OSCAR" },
    { value: "ed0a5d88-8730-427a-b543-acb35bf1ec9e", label: "BLANCO FERNANDEZ, MARLA GABRIELA" },
    { value: "dbc3f64f-520b-4580-9866-e44c4a9b88ed", label: "BONOMO, FERNANDO JOSE" },
    { value: "265e0700-d554-4caa-a689-8f9181877576", label: "BORDON, CRISTIAN LEMUEL" },
    { value: "aa30fcf4-2e3a-41c2-b2d4-4891a00c9626", label: "BORRAR, BORRAR" },
    { value: "333fd540-56c1-46fc-82e5-a7385c36c0d2", label: "BRANCA, VIRGINIA ANDREA" },
    { value: "c5404461-a6b3-49df-97df-71eacb321c4e", label: "BRAVO , ANDREA VANINA" },
    { value: "9df66ed5-22fa-41db-8fbb-b8c9d5797283", label: "BROGNA LOPEZ (TEST), FABRICIO ANTONIO" },
    { value: "f1401cf8-b63b-4dd2-96ef-63162867fc9b", label: "BRUNO, SANTIAGO DANIEL" },
    { value: "46a56e42-10a8-43ee-a975-1201db444b3a", label: "BUCCIARELLI DEBREVI, VALENTINA" },
    { value: "72f53ee1-9b04-46cf-a8fd-f8eb9a36f673", label: "BUSTOS FERNANDEZ, AMALIA VICTORIA" },
    { value: "7bea1880-7de2-46d1-b07b-2abc83aebc5f", label: "BUTELER ROBLEDAL, FLORENCIA" },
    { value: "1bc5073e-86f6-4185-94ee-52e420687dde", label: "BUTELER ROBLEDAL, FLORENCIA" },
    { value: "21f5264a-aa57-4ef7-9c16-33ede7aa85df", label: "CABALLERO SANCHEZ, URIEL FRANCISCO" },
    { value: "aff8c375-9dde-4b1f-ad8d-2c2d3f0f451f", label: "CABRAL LOZANO, RODRIGO VICTOR" },
    { value: "9992550d-82e8-4c60-81cf-2c768c9a2321", label: "CABRERA ALLENDE, MARIA GEMMA" },
    { value: "6547464c-2d4e-443d-b604-4b010a9dfbc9", label: "CACERES HIDALGO, CARLOS SEBASTIAN" },
    { value: "b1e9a701-b00d-4db2-a933-b4785e9ddaa2", label: "CANGIALOSI MODICA, CECILIA IVANA" },
    { value: "06ce7075-0432-4362-a9e7-21d1e916741c", label: "CANTONI, ALICIA NEREA" },
    { value: "48007d8f-6904-40ce-ae6e-3f201c75f32e", label: "CAPDEVILA, GUILLERMO PEDRO" },
    { value: "a52f42d0-1f1a-476f-8c07-de05a52eb395", label: "CARENA, MARIA PAULA" },
    { value: "c66845b1-6d59-449e-aff5-2889e662e65b", label: "CAROSIO, GIULIANA" },
    { value: "08d8ab85-e868-424f-a83d-d6c7a0945b3b", label: "CARRIZO BECERRA, MAURO ESTEBAN" },
    { value: "a45679f2-1e88-450a-a57a-8c14da28b2d3", label: "CASTILLO, NATALIA MACARENA" },
    { value: "d17f08e8-1cba-46c0-b32a-262043ae2b02", label: "CASTORE BERGIOLI, FACUNDO NICOLAS" },
    { value: "f4514369-ea1b-44a9-88da-b6b7b19f7b03", label: "CATALANO, CRISTIAN ARIEL" },
    { value: "9f5f5df0-c71b-4921-9a57-29f9291fe94f", label: "CAVALIERI, JUAN IGNACIO" },
    { value: "2c30c4b1-c5a8-401f-a4f4-1a399278686e", label: "CENDON, BETIANA VANESA" },
    { value: "1ecd5d15-bc99-4f20-bcae-6ee3b5718ab9", label: "CERECEDA OLIVERA, ANA YANINA" },
    { value: "b42c49a9-bdbe-494a-a2c0-caabd6078e4d", label: "CERECEDA OLIVERA-NO USAR-DUPLICADO, ANA YANINA" },
    { value: "f5d01cb4-76e3-42ec-820a-c9e1ce275f6d", label: "CEREZO, MARIA BELEN" },
    { value: "a998bc88-f989-4dc3-86b4-93115d7e690b", label: "CERUTTI, ANDRES EDUARDO" },
    { value: "977ec0da-cf15-4d42-8afb-51b937a81876", label: "CHIFFEL, GABRIELA MELISA" },
    { value: "6b834fcb-3d00-4c9e-b28d-2de573f8f3a1", label: "CHIRINOS , JOSE" },
    { value: "de5343e2-fa10-4f87-94f8-358495101f1b", label: "CID, OSCAR OMAR" },
    { value: "89a89370-2a01-4e2a-9083-b4952a006578", label: "CODORNIU DOMINGUEZ, MARIO FELIX" },
    { value: "4b3c2494-d0ea-4bc3-b33d-1b526e48a400", label: "COFRE , GRACIELA ANALIA" },
    { value: "442d6f30-600a-45e3-8870-30b5c7854fc1", label: "COY , MARIELA LUJAN" },
    { value: "de2173a1-03a5-4d65-82f3-c746ecd00d13", label: "CREMADES REBOREDO, DIEGO NAZARENO" },
    { value: "7c680b4d-fae8-4022-99cc-31470d3b85cf", label: "CRUZ, RUTH PERLA" },
    { value: "aa93c60e-6382-4891-b5cf-52ccdc3deeab", label: "CUNEO BARBANO, SERGIO ESTEBAN" },
    { value: "7049ce31-e8f8-49ce-87c6-40158f41bf09", label: "DE LUQUE, PAULA" },
    { value: "e0cd052f-9785-4232-80b9-dfc47723eab1", label: "DIAZ, ADOLFO EDUARDO" },
    { value: "28c33583-f72f-4b6e-a945-b1d55662a0cd", label: "DIAZ , ANALIA ELIZABETH" },
    { value: "94bbae9d-1cf2-43a9-a47d-fba95b3571d8", label: "DIAZ PUCHULU, PATRICIO JOSE" },
    { value: "28560356-ccdd-41a8-9855-7fde31cef7b2", label: "ECHEGARAY , GRACIELA EDITH" },
    { value: "cabd057b-6c32-47f4-aecd-d5292c8fb00f", label: "EDER, MARTIN ALEJANDRO" },
    { value: "c5eb7ba5-e831-40b5-bbc6-1aa5f1009480", label: "EIBEN MARTIN, EZEQUIEL JOSE" },
    { value: "c739068c-7b97-4b9a-86ba-4f6a8c9e1fcd", label: "EJARQUE ORIBE, DUILIO ALBERTO" },
    { value: "c0198b78-1465-492a-b613-b0dd59e9e368", label: "ELIZONDO, BLAS OCTAVIO" },
    { value: "03359e05-f76a-4795-9d50-d610b6abe0a2", label: "ESTELA PASSARELLI, YANINA VANESA" },
    { value: "6f6f504e-71fa-487c-a552-110f7aadb9a3", label: "ESTEVEZ RUBIA, DANIELA GISSELLE" },
    { value: "18e354b1-e2bd-472b-bed0-99d5e9febfc2", label: "FERNANDEZ , EDUARDO BENJAMIN" },
    { value: "bf0a2af8-3a2f-4e35-802f-00884b3a93e2", label: "FERNANDEZ JAHDE, MIGUEL ANGEL" },
    { value: "0fba9c68-83e2-4d0f-8f09-b56eaf6853b7", label: "FERNANDEZ MOLINA, ANA FLORENCIA" },
    { value: "b22ca86f-3034-4e25-8f56-a8867def4514", label: "FERRER, PABLO ALFREDO" },
    { value: "5a80dcb7-c513-4f76-9c4a-bbb8f15adcc0", label: "FLORES , MIGUEL ANGEL" },
    { value: "042a2689-7091-4e8d-8d8d-f93a110e8e8f", label: "FLORES SALA, MAURICIO ADRIAN" },
    { value: "036d65c3-8cbf-4332-a3ae-79e2ef9862b4", label: "FUNES ARIAS, ERICA FLAVIA" },
    { value: "d10185b0-02ed-4f44-8be1-1d27d6c428fc", label: "GALANTE, CLAUDIA YANINA" },
    { value: "5c77c418-5716-4fe0-8a7b-2c236cd3a951", label: "GALIANO, ROBERTO OMAR" },
    { value: "87c13120-b568-4bfb-af34-1afe13b41154", label: "GALLASTEGUI MALLA, EDUARDO SAMUEL" },
    { value: "ee94d62b-4886-4df7-9997-f40f56b8f367", label: "GALVANI, DANIEL MARIO" },
    { value: "4b04d87f-aaf6-4874-a1c0-f03c3a133ebd", label: "GALVEZ, JUAN MANUEL" },
    { value: "86774377-ea10-4bc4-916f-5e84c8190da8", label: "GARCIA, SILVANA NYLDA" },
    { value: "744bc442-759d-485f-995d-f632807c07f2", label: "GARCIA THOMAS, EDUARDO MARCELO" },
    { value: "6a10e696-9094-40b2-96c1-47aa9c18688b", label: "GARRIDO , LUCIANO PEDRO" },
    { value: "7dcc1f1d-55ff-45c7-89a9-0383b0990f84", label: "GAY, MIGUEL ANGEL" },
    { value: "7b84c327-f429-4aeb-8100-29c9d7c912db", label: "GERARDUZZI, CRISTIAN ALBERTO" },
    { value: "2f91350b-3c85-4535-ba5c-a1f753e23a75", label: "GERARDUZZI, SILVINA ELEONORA" },
    { value: "0535dc0a-c0fe-4e09-8a6f-99705d6af130", label: "GHILARDI, OSCAR ANDRES" },
    { value: "42954cff-5758-4aa3-b25c-3425228bcef6", label: "GIAMMONA  (TEST), MARIANA" },
    { value: "f9cf5884-89de-47d1-83ea-97024365ba09", label: "GINESTAR, ADRIANA ELIZABETH" },
    { value: "d25d9faa-73e2-4cbf-9030-83ddb90c486f", label: "GINSBERG COLOMBERO, ROBERTO ANDRES" },
    { value: "fc366bd6-550b-4c54-8bb3-ce988f4293bc", label: "GIUFFRIDA , MARIA TERESA ADELA" },
    { value: "44f863f9-6341-4a86-9988-37cf46b22d7a", label: "GOMEZ, MARCELO ALCIDES" },
    { value: "b221d796-9fd7-4e0e-99ed-18f7b5057aac", label: "GOMEZ GARCIA, SEBASTIAN ALEJANDRO" },
    { value: "f822db06-6328-4c26-8ab6-2072308841d6", label: "GONZALEZ SACCO, GUILLERMO" },
    { value: "3c80d3b8-b896-4671-af7a-9451ac29ce31", label: "GOVETTO , MARTIN HERNAN" },
    { value: "6041a3b3-a7d2-467e-9e97-561e8638191c", label: "GRAFFIGNA, MARCELA INES" },
    { value: "86623881-7c43-4612-ae20-6d0e72e1ceb5", label: "GRAFFIGNA-NO USAR-DUPLICADO, MARCELA INES" },
    { value: "e7fd819d-96e1-4a07-a49a-647fa7870cb3", label: "GRASSI, IVAN AUGUSTO" },
    { value: "8dca9171-f315-459f-b996-15663a6dd392", label: "GUERRERO, FERNANDO ANIBAL" },
    { value: "f88c7cab-1596-478d-abb2-11f3419fa8b0", label: "GUEVARA MANRIQUE, MIRTHA ALEJANDRA" },
    { value: "49bd6f2b-29f0-4440-adc9-c19f4d052575", label: "HEREDIA, GUILLERMO ALBERTO" },
    { value: "6588f0d7-64f1-4a05-a165-b0ced3bfac31", label: "HERNANDO , ANA GUILLERMINA" },
    { value: "aa3fffd7-b6e8-434e-ba58-981908f37808", label: "HERNANDORENA, SEBASTIAN IGNACIO" },
    { value: "5bf85e85-a9ba-48c1-8a66-6e5e16869f5d", label: "HERRERA , GUSTAVO FABIAN" },
    { value: "c76df206-6fd9-4358-88ed-6d0fb7dfd22d", label: "IBAÃEZ , GUILLERMO CESAR" },
    { value: "6270f00c-4130-4c00-a4c2-cee4cf09eeed", label: "IBAZETA, CARLOS NAHUEL" },
    { value: "04bafb33-d39d-4b83-936e-e0e89b9048db", label: "IGLESIAS GALANTE, RAUL JOSE" },
    { value: "ab940f5b-9208-4807-92cf-2bdb5a90a884", label: "INSEGNA, ANDREA VIVIANA" },
    { value: "3d4bf285-3047-44de-b7ef-1d54eced16ca", label: "ISLA INTI, CESAR" },
    { value: "1ca41b75-48e0-4cd3-8202-122ff7f13f87", label: "JUAREZ PRIETO, RICARDO MARIANO" },
    { value: "a98dced3-f045-4c9a-82d2-8ae6dcf8b00e", label: "LANFRANCHI , CESAR IGNACIO" },
    { value: "a0ef4ef6-de6e-40f8-a3f9-857973d27047", label: "LENA , NOELIA MARIANA " },
    { value: "0b0f09f1-f049-4117-ac25-6f0ab685b01f", label: "LISTA , GUILLERRO ALEJANDRO" },
    { value: "8f167238-e54f-4f67-bf65-e17912d1b1d3", label: "LOBILLO SALVA, JULIETA DEL VALLE" },
    { value: "9236ec47-9763-4a32-a2c2-c429a07243e1", label: "LOPEZ MUÑOZ, ANA LAURA" },
    { value: "c2b597c4-315e-4c0b-a753-70aee53bef85", label: "LOZADA , MARTIN" },
    { value: "253f022f-4cd9-4a9c-99b3-bfc931453737", label: "LOZANO, NO UTILIZAR-DUPLICADO-CAROLINA DEL ROSARIO" },
    { value: "3613580b-5242-4ecb-b605-5d8812392bcd", label: "LOZANO, ROLANDO ANIBAL" },
    { value: "e3db8c61-94b1-41a4-b385-0bc8aee3e354", label: "LOZANO DE ORO, MARTINA DEL ROSARIO" },
    { value: "775a8598-ac6d-4bf1-919d-c133706d754e", label: "LUCIA , RITA ANGELA" },
    { value: "bd2dd16b-ca64-4ed2-a1ca-762bf276b43f", label: "LUJAN CAMACHO, MARIA GEMMA" },
    { value: "29edf654-537d-40ae-bc61-1de644f3182b", label: "LUPPI , JUAN CARLOS RAILE" },
    { value: "757c2da0-553d-468c-8423-c46e68d77137", label: "MALDONADO, MARIA LAURA" },
    { value: "fa2f161b-8812-4c5e-9041-da6a35e70e1d", label: "MALDONADO NO USAR, PERSONA EN CONFLICTO" },
    { value: "a76df575-ee91-444f-afd0-0facfaa0b51c", label: "MALLEA MARCUCCI, ROBERTO" },
    { value: "2cf89a9e-d43d-4458-8c3e-ab50a85a042f", label: "MARINERO, LILIANA ELISA" },
    { value: "ea1f097a-2bb3-47c3-8bf8-9c55e23961be", label: "MARQUEZ GAUNA, SANTIAGO" },
    { value: "8f15b7b3-c8cf-454a-bf2c-c4c8611b24e9", label: "MARQUEZ MALLARINO, YANINA ELIZABETH" },
    { value: "85d7b8d8-b525-40a1-a096-2041814677c7", label: "MARSIGLIO, MARIA ISABEL" },
    { value: "7fa8d2a7-39d5-466b-86f7-e04e40a67583", label: "MARTIN, SILVIA ELENA" },
    { value: "86ac0bf0-5f87-4019-82ee-25368d47d966", label: "MARTIN FERNANDEZ, PABLO FRANCISCO" },
    { value: "1214d1ee-c2da-45bc-9128-d67d3dd7a5f2", label: "MARTINEZ, ALBERTO MIGUEL RAMON" },
    { value: "41bf7c4f-50be-4a02-aa8e-3caf9a2c0b3c", label: "MARTINEZ YANZON, EDUARDO ALEJANDRO" },
    { value: "7a139935-8d73-474c-8744-47e627ecc8b8", label: "MASCARELL, MARIA ROMINA" },
    { value: "568c4072-e020-4149-9fe7-9a33c9526c7d", label: "MATTAR OROZCO, MARIA VERONICA" },
    { value: "32d5de86-bbae-4e3e-8294-cdddc33732d8", label: "MATTAR PINA, JUAN MARTIN" },
    { value: "4463b598-6ee0-4ba9-b6c9-8a60c84b5840", label: "MATTAR SABIO, ALEJANDRO DANIEL" },
    { value: "fbed86ac-a497-4687-abb4-746c9c04334b", label: "MATURANO, CARLOS ELIAS" },
    { value: "5be79f2d-33a2-4774-9a92-f70d7b3f9351", label: "MEDICI, FABRIZIO" },
    { value: "45c67eef-555d-4b6a-81d3-1924f8da88cc", label: "MELO, HECTOR FABIAN" },
    { value: "f0d96bc6-f629-48cd-a016-9e786640f7d3", label: "MENDOZA MORVILLO, GUSTAVO EDUARDO" },
    { value: "46da43e5-441b-4745-9a9c-9b4cc97d3cb5", label: "MERLO, GUILLERMO DANIEL" },
    { value: "2ef524f1-0d52-439a-adf8-258108f655b4", label: "MICHELTORENA PONZO, FRANCISCO BRUNO" },
    { value: "0ab4daed-1804-488a-baea-2b6ac8283cda", label: "MIGANI, GIULIANA" },
    { value: "a080a02a-4ab6-4152-9497-5211780c0b7e", label: "MONTAÑO LUNA, FRANCISCO EMMANUEL" },
    { value: "6a12a37c-0403-4fde-bd7f-52b4abffbea0", label: "MONTENEGRO , YESICA LUCIANA" },
    { value: "909e6e43-7dbb-4246-aacb-16b13f521f10", label: "MORALES NAZARA, AGOSTINA BELEN" },
    { value: "1fcda17b-9180-48a1-b129-fc3a006a7083", label: "MOYA GONZALEZ, MARIA LORENA" },
    { value: "5221f2b7-d27f-4299-86f5-a8c3198ab75b", label: "MOYANO, MICAELA CLAUDIA" },
    { value: "14078101-c5f6-4cdd-bbae-393c70f5e635", label: "NELLI , ANDRES JOSE" },
    { value: "4d1530cd-83f1-4c7d-84db-df68981bec55", label: "NICOLIA HERAS, FRANCISCO JAVIER" },
    { value: "bd7aff73-f382-447a-9f4d-30aa8d674d5a", label: "OLEA , LAURA ANDREA" },
    { value: "7ba365da-0c0d-4e53-b4a5-0f9ef74c08aa", label: "OROPEL, OSCAR SANTIAGO" },
    { value: "81c084a8-50a2-4982-aedf-ae468d16c01d", label: "ORQUIN, ALFREDO ANGEL" },
    { value: "ed6b763d-c9e9-4e02-a64d-a66a2dd2311c", label: "PACHECO, MARIA CECILIA" },
    { value: "29b7e49b-3792-403a-9fee-e7c95525c181", label: "PANETTA SOPPELSA, MARIO ALEJANDRO" },
    { value: "a5400d20-00cb-4ca2-a0ab-4616fa0b4a51", label: "PAOLINI, SILVIA ALEJANDRA" },
    { value: "8c1ee68c-084a-436e-a2a8-1b9ca088d4f2", label: "PARRA, MARIO JESUS" },
    { value: "a77fbb52-cff1-400b-b382-9fc0b207611b", label: "PASCUAL , MARIA NATALIA" },
    { value: "d23329c0-5dfb-4dd9-a3bd-b9f88132bb5f", label: "PELAYES, ADRIANA BEATRIZ" },
    { value: "206d8ce4-483c-4087-b529-586db85cf295", label: "PEÑA, DAVID ALEJANDRO" },
    { value: "ce43e370-e478-46fd-ba2b-37bf8b1aa739", label: "PERALTA, JUAN PEDRO" },
    { value: "41362dc0-5948-4745-9d2b-5da421980e09", label: "PEREYRA GUERRA, FEDERICO PABLO" },
    { value: "a90ffb1c-3bab-4dc5-9c0f-b6d41d290a2d", label: "PEREZ LLOVERAS, VIRGINIA MARIA" },
    { value: "328b0fcd-a06f-451a-8679-7ebdd35ea4a3", label: "PERI, YANINA" },
    { value: "a2997eec-f454-4d75-8a79-77f4155a244c", label: "PEZZETTA , MARTIN AUGUSTO" },
    { value: "b9d7c947-c001-4ac0-aa18-97376b25b09e", label: "PI MARTINEZ, FERNANDO RODOLFO" },
    { value: "f84240c6-f24b-4331-898a-05866cf7ee3f", label: "PICHETTO , SERGIO DAMIAN" },
    { value: "5db5062b-57ee-4bd4-ba70-509b5dd1502b", label: "PIERRONI , GASTON CESAR" },
    { value: "89814baf-c244-41b9-869d-fa46248b5dab", label: "PIZARRO, FRANCISCO JAVIER" },
    { value: "d812cbd4-a174-4290-a57d-4c442ffaaf42", label: "PLAZA BELLI, JOSE TOMAS" },
    { value: "b3d60e05-9fa7-4c2f-8386-032bf27c05ee", label: "PONS BELMONTE, NAIDA FLORENCIA" },
    { value: "a95f5d89-c1ec-4cd0-898d-a7613418e16f", label: "PRINGLES PINAZO, DANIELA ALEJANDRA" },
    { value: "3b195b08-459c-4afc-b1a3-f0d8e6ddb351", label: "PUEBLA, MARIA JOSE IRIS" },
    { value: "31c4fbb2-1715-49c2-9938-b159e4b6f03e", label: "PUEBLA, MELINA LILIAN" },
    { value: "5429ee4b-c8da-4495-8c08-a832b76c2d29", label: "PUIGDENGOLAS, CARLA YANINA" },
    { value: "f8defc1d-84a3-470c-bad7-d2241568ab42", label: "PUNTEL  (TEST), JUAN PEDRO" },
    { value: "528dba95-16cd-4829-94c2-8454c49d1e00", label: "PUTELLI, CLAUDIA SILVINA" },
    { value: "04ff5226-d17b-4eb0-9ad0-bfdbbd209724", label: "QUATTROPANI, EDUARDO" },
    { value: "b295632a-eae6-495a-8686-5c35bbe99e83", label: "QUATTROPANI, EDUARDO ARIEL" },
    { value: "eea57068-7be8-4345-8106-0a3ae3682cd3", label: "QUIROGA ONSALO, PABLO EZEQUIEL" },
    { value: "a099dc87-4a03-4d23-9ff4-8a0ba3bd33e8", label: "RAHME, FERNANDO LUIS" },
    { value: "2028ccf9-3d05-416a-aed2-41bd65729dac", label: "RAMACI AHUMADA, MARIA LUCIANA" },
    { value: "4e7623b0-4116-4ce2-b124-a2b39b738309", label: "REYES , NORMA MARGARITA" },
    { value: "c555ebd8-9fb9-428c-9a91-3de9e10f5264", label: "RIVERO, ROSANA GEMA" },
    { value: "55974694-2727-44f2-8851-aa020eac3460", label: "RIVEROS, GABRIEL ADRIAN" },
    { value: "78ddae88-3562-41da-8fec-b9c330b561de", label: "ROCA, ELIANA VALERIA" },
    { value: "a3e78b22-c7e9-4c86-8cc1-6fe246175ffa", label: "RODRIGUEZ, CARLOS EDUARDO" },
    { value: "6eaac0c9-88a9-4bf5-a31d-7b4d87ff4ec1", label: "RODRIGUEZ, FRANCO GERMAN" },
    { value: "5abb3692-9f87-4046-a8b6-0b48cea0206e", label: "RODRIGUEZ FRANDSEN (TEST), PAULA" },
    { value: "f62647da-41b4-47bf-adc7-dbf5f88427af", label: "RODRIGUEZ SCHMADKE, MARIA XIMENA" },
    { value: "c2ab5ade-8ed3-4cb4-94da-8030003249ad", label: "ROMERO , RICARDO ERNESTO" },
    { value: "0b2a791a-1b53-4711-ba7a-2686902e9f4a", label: "ROMERO GAMEZ, ROSA MARLA LAURA" },
    { value: "12b1c67a-3535-44e5-b973-22cf45f0b896", label: "ROMERO LEPEZ, FACUNDO" },
    { value: "5dff1e80-ddf7-4667-8fd7-11156c7c2cd4", label: "ROSSI, MARIA ALEJANDRA" },
    { value: "b5581f70-0b18-456b-acb7-ad3011634153", label: "RUIZ CARIGNANO, CLAUDIA" },
    { value: "be6124ca-50d5-4a3f-8c2b-608a53c9194c", label: "RUIZ LAHOZ, MARIA TAMARA" },
    { value: "f4a57015-6d43-4a31-a5ea-bdd0f6a0ad85", label: "SABIO LAMBERT, MARIA DEL VALLE" },
    { value: "31f1921b-3ceb-45b7-a1d9-b688fe192d97", label: "SALICA LOPEZ, CLAUDIA ALEJANDRA" },
    { value: "6c9f038f-da48-4426-bd0d-7c48822852ec", label: "SALICA LOPEZ - OJO! DUPLICADO, CLAUDIA ALEJANDRA" },
    { value: "45c1d2e5-b4ec-463f-8bbe-c59717e9326e", label: "SALINAS CALVO, VICTORIA" },
    { value: "e17a3d19-d6c6-40df-9ca4-a487b74236f9", label: "SALVATIERRA, GERMAN DANIEL" },
    { value: "212f1b57-fb8d-4d18-8839-79c2dcd4a9b8", label: "SALVIO, GASTON MATEO" },
    { value: "0248e03d-b5fe-4d19-869d-2cd0aa316b79", label: "SANCHEZ, MARIA BELEN" },
    { value: "9d37fb77-09fd-4956-8726-10695d19dfa1", label: "SANCHEZ GUTIERREZ, JORGE LUIS" },
    { value: "4c7c5278-3a5b-4518-899a-6293b3a6b763", label: "SANCHEZ VARAS, LEANDRO FEDERICO" },
    { value: "0bb0569a-dc75-4e7a-839b-5155dd5d260a", label: "SANCHEZ VARAS-NO USAR-DUPLICADO, LEANDRO FEDERICO" },
    { value: "d1b7ae22-4ea8-4e31-90f0-3a968405c290", label: "SCHIATTINO, NICOLAS GREGORIO" },
    { value: "0de74e35-0721-44b6-ba25-f96cdb7e3f36", label: "SCHOTT MORENO, INGRID CELINA" },
    { value: "e8066f07-0e12-4c56-9edc-566e3ddf9f7d", label: "SCHOTT MORENO BAJA, INGRID CELINA BAJA" },
    { value: "c8356b07-7078-4054-9716-06798dde0326", label: "SERER ONTIVERO, CECILIA ERICA" },
    { value: "9db7b10c-1bf7-4cf6-9008-d9bf12212eda", label: "SOLERA, ALEJANDRO DANIEL" },
    { value: "bfc6a139-58bb-418a-9dd2-c922129eafd7", label: "SOTO , TOMAS SEBASTIAN" },
    { value: "43d15b00-66bc-4761-839f-a938bddf3fa2", label: "SPATZER, BENJAMIN" },
    { value: "fb9cab2a-8dd1-4ff2-8e62-7875d09499e8", label: "STIEP , MATIAS NAZARENO" },
    { value: "72867a0c-3ef3-4c51-b6d3-95da63e9bdf5", label: "TEJA, HUGO MARIANO" },
    { value: "0bd67363-a5ce-4f90-9a96-9576b4d5b064", label: "TEJADA, ORLANDO DANIEL" },
    { value: "e86ea136-352a-4694-a5a0-59b81a910dcb", label: "TELLO ONSALO, MARIA LUCIANA" },
    { value: "a248afe7-9dcc-4279-a35d-6d71ece88ca3", label: "TESTING, FISCAL" },
    { value: "c5a0a731-1565-4595-8697-15a78b5761eb", label: "TORCCHIA , JOSE LUIS" },
    { value: "ece31169-3dfe-43d6-9570-6605eabfd217", label: "TORRES, MARCELA CRISTINA" },
    { value: "85a230b8-8387-4bd2-b142-e0bb9e474bbf", label: "TORRES, MARCELA CRISTINA" },
    { value: "dc27b57a-5621-4b89-ad4c-560f26be5c26", label: "TREJO  (TEST), HERNAN FELICIANO" },
    { value: "a722b6bd-60e2-47ad-a117-a80b3679087b", label: "USIN AGUILAR, EMILIANO JESUS" },
    { value: "75a687d6-0aaa-4670-b49c-c1d553bbcc96", label: "VACA PRINGLES, MARIA BEATRIZ" },
    { value: "d1bfb9b2-a87a-46bd-945b-5a634596cb29", label: "VALLEJOS , EUGENIA VERONICA" },
    { value: "adf48b2a-85b8-4377-8655-b5f51774807f", label: "VASSELLATI , IVANA DENISE" },
    { value: "69ba4a39-c727-4fab-b649-71c760dd4845", label: "VENTIMIGLIA CHIRINO, AGOSTINA" },
    { value: "26e0bb85-97da-4e71-aedc-7ee307e1ad39", label: "VIDELA, RODRIGO DANIEL" },
    { value: "ff9bb35b-10ae-41a9-a114-2c353029068a", label: "VILLA , JULIETA NAZARENA" },
    { value: "070e6927-765b-4f50-8cc6-af9e397ec9f3", label: "VILLALBA, LEONARDO NELSON" },
    { value: "1db1ef80-8673-44d2-886e-eddb645d334e", label: "VILLALVA CASTRO, MARIA DEL VALLE" },
    { value: "c5c21786-69a4-4df3-a8d6-bd6a06fe64a6", label: "VILLAVICENCIO, ELIANA ALEJANDRA" },
    { value: "36c4fa5a-86df-4a20-9e56-b3faa1802593", label: "VIOTTI , ZILLI MARICEL" },
    { value: "c00e354f-e5ac-452b-9179-8fe6744d31ca", label: "YACANTE, GERARDO ANDRES" },
    { value: "0f4a323b-05b9-4fa0-afb2-dd4e0244bbb6", label: "YANARDI, ATILIO SEBASTIAN" },
    { value: "8543c766-4f79-4733-8c30-a192fc1a7364", label: "YANZON AVENDAÑO, CARLOS MARIO" },
    { value: "d1843e1a-d74c-453a-9beb-c46ccb7f8d84", label: "ZABALETA, RODRIGO NICOLAS" },
    { value: "1b432b91-464b-4e79-9ee3-fe84f74170e9", label: "ZALAZAR GONZALEZ, MARIA AGOSTINA" },
    { value: "35645256-dd23-4e64-bcc1-c1adb3c0502b", label: "ZAPATA, EUSEBIO NICOLAS JULIO" },
    { value: "21188249-b334-45d9-8f84-8cd59cbcdea5", label: "ZAPATA BRIDGE, NICOLAS" },
    { value: "6256aee5-9a99-4c7f-8822-5182abc92dba", label: "ZOGBE SANCASSANI, MARIA SILVINA" },
    { value: "14d2b6b9-176e-4bd2-8660-52349e3353da", label: "ZORNITTA , DANIEL GUSTAVO" },
]

const DEFENSORES = [
    { value: "705d070a-8146-42e0-862f-13ce61c254c8", label: "ADARVEZ, GUSTAVO ADRIAN" },
    { value: "2399ffe2-99b0-4b02-a1fc-97a52d2c655d", label: "ALICE BARILARI (TEST), ANTONIO ARIEL" },
    { value: "80482133-49c4-477b-8b02-0deacf8a74dc", label: "ALVAREZ MELINGER, MARCELO OSCAR" },
    { value: "2523ea9c-4e2e-47d8-8cb4-3c029e2e0a6d", label: "AMAYA, HUGO RODOLFO" },
    { value: "d7d11013-b18a-4743-bc29-5b60ee3edac5", label: "ANDINO VEGA, JULIO JOSE GUILLERMO" },
    { value: "38695736-d21f-4470-a1b6-f5b48c72beff", label: "ARIAS, PATRICIA ALEJANDRA" },
    { value: "18a467b0-5053-4d2c-97b7-c005fe25e1bd", label: "AROCA ALVAREZ, MARIA ESTELA" },
    { value: "54755f1b-974c-4cfa-9433-57cbea211d1f", label: "AYENAO , SILVANA SOLEDAD" },
    { value: "520b0062-2f78-4b35-b3c8-5c1014b347d3", label: "BENITO, SANDRA ROSANA" },
    { value: "cdef1904-a888-4495-93da-fa7520e86931", label: "CABELLO, CECILIA TERESA" },
    { value: "c929c73f-150b-4f2d-a49a-8ec157e123aa", label: "CARABALLO , MARCELO LUCAS" },
    { value: "a0699e19-6dcb-48d7-b3ec-c57abbda5190", label: "CARDOZO , VERONICA ANDREA" },
    { value: "d6c46702-4f66-4c0b-ad6f-895b4499bf44", label: "CARRERA , EDUARDO LUIS" },
    { value: "2312f415-4259-4aa1-bfcf-015b16134ef7", label: "CARRIQUEO (TEST), MARGARITA GRACIELA" },
    { value: "d5d363d6-1f97-4109-82ca-66f62fd998d5", label: "CICIARELLO, MARCOS DOMINGO" },
    { value: "c33ad953-10a8-45a0-a1d3-68f3d66ede1f", label: "CORIA POSLEMAN, SILVANA GUADALUPE" },
    { value: "7735986d-65c5-47e2-85a7-951c67e62d27", label: "CURI ANTUN (TEST), CAMILO JUAN" },
    { value: "84fde85d-5d01-4939-93eb-807dcc41fbc4", label: "DE ROSA, NATALIA VANESA" },
    { value: "9c8aba46-3814-477e-8379-52f07c3cc46b", label: "DELGADO , CELIA GUADALUPE" },
    { value: "7a9035af-1e88-48b1-9e31-9ff7e6cdb587", label: "DIAZ, MARIA CRISTINA" },
    { value: "d0ff8898-2db9-4761-91a4-b2b3f306cd2b", label: "DIAZ NIETO, FEDERICO ALEJANDRO" },
    { value: "e165144b-5491-49da-b76f-c1654bb70b5c", label: "DOMINGUEZ , MARIA LAURA" },
    { value: "872d7186-2732-41c5-a420-5525fe9132b8", label: "DONATE, CECILIA MARIELA" },
    { value: "8abf962d-b44f-4b9f-985d-a459c7d3512a", label: "ESPEJO, NATALIA ANTONIA" },
    { value: "4f11a407-c0bf-46a8-839c-839b079ff583", label: "FERNANDEZ BRUNO, MARIANGEL" },
    { value: "e7b8b127-7434-4ef7-9ead-4a46789d70b3", label: "FERNANDEZ IRUNGARAY, ANA MARIA" },
    { value: "19209523-b8fe-4abe-b3c2-e89a19a84ff0", label: "FIDEL, DEBORA" },
    { value: "c633ed27-e4bd-43b9-8e1e-e24df937173f", label: "FLEURY, CARLOS EDUARDO" },
    { value: "1b628c12-431b-43ec-b811-55473fbf92db", label: "GAFFOGLIO, FIORELLA ROMINA" },
    { value: "3e83f866-b316-461b-b23e-e2e12b515a14", label: "GALATRO, MARIA DANIELA" },
    { value: "19f91848-46f3-46ed-a3b3-4823a9adf790", label: "GARCIA, JUAN" },
    { value: "84872b4f-f295-4be5-8973-9141fa7993dc", label: "GARCIA PACHECO, JUAN CARLOS" },
    { value: "4bda4995-750a-442b-87ae-27bf6eb653ff", label: "GHIANNI , MARTA" },
    { value: "01baf6b4-b905-48ac-baf7-0468f9b2fc09", label: "GIL NALE, JUAN FACUNDO" },
    { value: "62d06ace-20bc-435f-b90e-bc6b271056e3", label: "GONZALEZ GARCIA, VERONICA LIDIA" },
    { value: "a66f8bd4-2ebb-47a6-b5f5-9e637c6d47fe", label: "GONZALEZ RIUTORT, JUAN CARLOS" },
    { value: "d0373961-7004-4848-b21d-d589e530c72e", label: "GONZALEZ VITALE, LAURA INES" },
    { value: "58001129-3318-45da-9a41-b9663b5465c6", label: "HERRERO PALACIOS, ANA VICTORIA" },
    { value: "42c3c7d8-476c-4520-a81c-398b4ecd3087", label: "ILLANES CABALLERO, MARIA BELEN" },
    { value: "9a1d53ea-cbe6-4966-9a67-45f420db7aad", label: "JUAREZ MEDINA, SERGIO" },
    { value: "8aa5b3c6-f328-476d-8be8-035a755a3b26", label: "LAURENCE , JUAN PABLO" },
    { value: "4d68f29c-71f0-47f1-a8dc-d0567453cf85", label: "LEVEQUE SANCHEZ, SANDRA LORENA" },
    { value: "caf64cc7-45e8-48cc-92e0-cff8769f8fad", label: "LOZANO, CAROLINA DEL ROSARIO" },
    { value: "7d905110-f93c-4c37-ad62-e7ea98014656", label: "MARTIN GARCIA, ALEJANDRO RAUL" },
    { value: "2e495130-b85e-4f16-949c-d6f2fccd0888", label: "MARTINI , ROMINA LIA" },
    { value: "f706a6ff-44aa-4272-b0ce-c4b77e3f7402", label: "MAYER, RICARDO JOSE JUAN" },
    { value: "10969f77-81e0-4d5b-ab54-87aaeb347ab0", label: "MERINO,  SUSANA ALICIA" },
    { value: "f5565871-54e6-43ea-8dec-f57f4d34c166", label: "MONTIEL ZELKO, DANIEL ANGEL" },
    { value: "8a1909f1-610f-4de8-b5b4-06687b61e3ea", label: "MULET, DEBORA" },
    { value: "fc7c3209-dfc0-4c74-9098-41048d7ab2ce", label: "MUT RUSSO, CECILIA" },
    { value: "9a1ed8d1-8aa2-4e43-b157-b58e33dbb87c", label: "MUTCHINICK , OSCAR ENRIQUE" },
    { value: "b7bde10e-bc53-4ca3-98fd-ba09c4b98dad", label: "NIELSON RAMELLA, MARIA EMILIA" },
    { value: "b94448ec-9f60-4a85-9dc9-0d6d50e2aa1d", label: "NOLIVO , MARIO SEBASTIAN" },
    { value: "c482c307-4c2f-4c0a-9311-86d617c1b05d", label: "ORO, CESAR ADOLFO" },
    { value: "5bd53169-63b9-413b-baab-681b5de61397", label: "ORTIZ, RICARDO ISIDRO" },
    { value: "be024c67-a5d7-45b5-999f-a07a67934f72", label: "OSPITAL, JAVIER ANDRES" },
    { value: "04a03290-f7f2-4135-8cd4-c6d800024297", label: "PALACIOS, GUILLERMO" },
    { value: "b2995834-ea5b-42b2-863a-7ed596e8bf38", label: "PANDIELLA, JUAN CARLOS" },
    { value: "249623bf-7540-4395-a3d2-4d7450544b06", label: "PAPE , MARIELA SUSANA " },
    { value: "f5e1b5b7-e18c-49df-b6e3-bd1d083ea6e9", label: "PEREZ AUBONE, MARIA AGUSTINA" },
    { value: "111e9140-b482-4f93-8534-ff99470da41a", label: "PEREZ VILLEGAS, MARIA LILIAN" },
    { value: "34b07b2b-d223-4710-9665-1578cdd1afc7", label: "PERSICHELLA PARRA, ANA PAULA" },
    { value: "6e0dfa30-d0dc-4459-b67f-ce7586f49367", label: "PIOMBO , JUAN PABLO" },
    { value: "9efc92c4-ff40-40f3-aebb-b4445c483432", label: "QUESADA, ELIZABETH GLORIA" },
    { value: "fccb682a-2006-4f6e-a671-20e828b23943", label: "QUIROGA ALSINA, JAVIER ALFREDO" },
    { value: "0076542b-1863-42b6-9d2a-5a165c793b2f", label: "QUIROGA VITA, LUCAS ANDRES" },
    { value: "d9b3a741-d519-4009-95bd-2a8f4e186017", label: "REILOBA, CARLOS ALBERTO" },
    { value: "953c6184-98e5-45bd-95c0-a26c578231b0", label: "RIVERA TRUGLIO, FERNANDO JAVIER" },
    { value: "de652976-0206-4fb6-9329-24250e799b8a", label: "RIVEROS, CRISTIAN MATIAS" },
    { value: "4a09106a-3f7d-4f06-82ca-6227829063b5", label: "RIVEROS MUSCARELLO, GERMAN GABRIEL" },
    { value: "a631ab48-7e5d-4fca-98ff-53b0c2ecfb7a", label: "RODRIGUEZ, ELIDA LILIAN" },
    { value: "64f3faa9-ae7c-4020-a170-0d0ad4d5360c", label: "ROJAS , FLAVIA LORENA" },
    { value: "f6cd8247-7495-46b2-a6f9-4ffc2d15a736", label: "ROSENDE, MARÍA CELINA" },
    { value: "23152705-4553-4180-b0a3-0ad66f1a984a", label: "SALINAS WEBER, MARCELO ADRIAN" },
    { value: "90504fb6-9c01-42a9-9844-e7fe05987faa", label: "SALOMON , MIGUEL" },
    { value: "16a1ea50-c0cf-440b-af18-d89e6578bc06", label: "SANCHEZ, FRANKLIN RAUL" },
    { value: "821d8529-3b49-4b4c-ba95-c9997e74e7d5", label: "SANTOS, FRANCISCA JOSEFINA" },
    { value: "5d4b30c1-d7e6-423c-925d-7966dfa2c577", label: "SEFAIR, MONICA BEATRIZ" },
    { value: "37fd9cbd-4cfd-4ece-8438-39fe86e83c68", label: "SERRA , MARIANA" },
    { value: "74b56028-b758-4576-b401-d0ca95d0ee41", label: "SILVERA, MARISA DEL CARMEN" },
    { value: "0a43efb1-0f39-4b0a-b6d4-063f5de7746f", label: "SORIA BALMACEDA, AGUSTIN NICOLAS" },
    { value: "84205a93-4382-4c60-bb9c-aa461078c62f", label: "STADLER , RICARDO HUGO" },
    { value: "ff9d16b4-2924-4ba1-b025-057757dba34e", label: "TEJADA ECHEVERRIA, RODRIGO MATHIAS" },
    { value: "5239836a-0ee6-43ec-909f-de8df58a695d", label: "TERRAZA, ALICIA BEATRIZ" },
    { value: "e72ace23-f2b2-4784-9299-59deb922bb49", label: "TRIGO LUCERO, HUGO ARIEL -" },
    { value: "8ab8fb00-a271-492d-851a-d1d0f456f807", label: "TURON, JORGE DANIEL" },
    { value: "2033a8b6-759f-421f-9875-ed6528287945", label: "VALLEJOS, ANA CAROLINA" },
    { value: "fdc05b9c-4276-4c52-9e95-209abffa04c4", label: "VEDIA, MAXIMILIANO" },
    { value: "1a6d013e-7c1b-414b-9b52-a6d02e27ebe0", label: "VEGA , PEDRO JAVIER" },
    { value: "1a3e0c98-ecb3-420c-8f05-8fae04863c3b", label: "VEGA ARUSA, GONZALO" },
    { value: "4a200217-163e-4097-9219-cec0c627cfb2", label: "VERA, CLAUDIO OMAR" },
    { value: "7d0973c8-673e-4e54-a20d-609171e01b3a", label: "VIECENS , GUSTAVO JORGE" },
    { value: "4d1862d4-8757-43f9-a641-0e9479e9138b", label: "ZAPATA LLOVERAS, LISANDRO ANDRES" },
]

const MOTIVOS_JUEZ = [
    { value: "d44576a8-a802-4b6d-86ef-374219150e3e", label: "ANIVI" },
    { value: "4c5299f0-b65a-4192-b652-aff42f40a908", label: "JUICIO" },
    { value: "3114ef2d-6986-4e7e-8c04-d65b9905f6db", label: "LICENCIA" },
    { value: "5dd721a8-f429-4879-8aaa-679ad9b89d1c", label: "OTRO" },
]

const MOTIVOS_AUX = [
    { value: "bf163a5c-be29-47fc-959e-73e3cc8acbc5", label: "AUDIENCIA EN OTRA JURISDICCIÓN" },
    { value: "0ace6066-2c42-44b5-8609-c7bb73ce4355", label: "CAPACITACION" },
    { value: "4142a3a5-eff7-4ee8-a38a-74a50fdbca89", label: "LICENCIA" },
]

const BLOQUE_REGEX = /^\d{2}\/\d{2}\/\d{4} \| \d{2}:\d{2} - \d{2}:\d{2}$/

// ── Componente ────────────────────────────────────────────────────────────────
export default function BloqueoMasivo() {
    // Config global
    const [tipoPersona, setTipoPersona] = useState('juez')
    const [idPersona, setIdPersona] = useState('')
    const [idMotivo, setIdMotivo] = useState('')
    const [observaciones, setObservaciones] = useState('')

    // Helpers para obtener sub-listas según tipo
    const getPersonas = () => {
        switch (tipoPersona) {
            case 'juez': return JUECES
            case 'fiscal': return FISCALES
            case 'defensor': return DEFENSORES
            default: return []
        }
    }

    const getMotivos = () => {
        if (tipoPersona === 'juez') return MOTIVOS_JUEZ
        return MOTIVOS_AUX
    }

    // Lista de bloques
    const [bloques, setBloques] = useState([])
    const [nuevo, setNuevo] = useState('')
    const [nuevoError, setNuevoError] = useState('')
    const [editIdx, setEditIdx] = useState(null)
    const [editVal, setEditVal] = useState('')
    const [editError, setEditError] = useState('')

    // Estado del proceso
    const [estado, setEstado] = useState(null) // null | 'loading' | 'ok' | 'error'
    const [progreso, setProgreso] = useState({ index: 0, total: 0, exitosos: 0, erroresCount: 0 })
    const [erroresList, setErroresList] = useState([]) // [{ bloque, motivo }]
    const [mensajeFinal, setMensajeFinal] = useState('')

    // ── Agregar bloque ──────────────────────────────────────────────────────
    const handleAgregar = () => {
        const val = nuevo.trim()
        if (!BLOQUE_REGEX.test(val)) {
            setNuevoError('Formato inválido. Usá: DD/MM/AAAA | HH:MM - HH:MM')
            return
        }
        if (bloques.includes(val)) {
            setNuevoError('Ese bloque ya está en la lista.')
            return
        }
        setBloques(prev => [...prev, val])
        setNuevo('')
        setNuevoError('')
    }

    const handleEliminar = (idx) => {
        setBloques(prev => prev.filter((_, i) => i !== idx))
        if (editIdx === idx) { setEditIdx(null); setEditVal('') }
    }

    const handleGuardarEdit = (idx) => {
        const val = editVal.trim()
        if (!BLOQUE_REGEX.test(val)) {
            setEditError('Formato inválido. Usá: DD/MM/AAAA | HH:MM - HH:MM')
            return
        }
        setBloques(prev => prev.map((b, i) => i === idx ? val : b))
        setEditIdx(null); setEditVal(''); setEditError('')
    }

    // ── Lanzar (con streaming SSE) ──────────────────────────────────────────
    // ── Lanzar (via IPC) ────────────────────────────────────────────────────
    const handleLanzar = async () => {
        if (!idPersona || !idMotivo) {
            setMensajeFinal('⚠️ Seleccioná Persona y Motivo antes de continuar.')
            setEstado('error')
            return
        }
        if (bloques.length === 0) {
            setMensajeFinal('⚠️ Agregá al menos un bloque horario.')
            setEstado('error')
            return
        }

        setEstado('loading')
        setErroresList([])
        setMensajeFinal('')
        setProgreso({ index: 0, total: bloques.length, exitosos: 0, erroresCount: 0 })

        const removeListener = window.electronAPI ? window.electronAPI.on('bloqueo-masivo-progress', (event, data) => {
            const ev = typeof data === 'string' ? JSON.parse(data) : data;
            if (ev.type === 'progress') {
                setProgreso({
                    index: ev.index,
                    total: ev.total,
                    exitosos: ev.exitosos,
                    erroresCount: ev.erroresCount,
                })
            } else if (ev.type === 'block_error') {
                setErroresList(prev => [...prev, { bloque: ev.bloque, motivo: ev.motivo }])
            } else if (ev.type === 'done') {
                setEstado('ok')
                setMensajeFinal(
                    `✅ Proceso terminado. ${ev.exitosos} bloques exitosos` +
                    (ev.errores.length > 0
                        ? `, ${ev.errores.length} con error (ver detalle abajo).`
                        : ', sin errores.')
                )
            } else if (ev.type === 'fatal') {
                setEstado('error')
                setMensajeFinal(`❌ Error fatal: ${ev.message}`)
            }
        }) : null;

        try {
            if (window.electronAPI) {
                await window.electronAPI.invoke('bloqueo-masivo', {
                    fixed: { tipoPersona, idPersona, idMotivo, observaciones },
                    bloques,
                });
            } else {
                // Fallback a API para desarrollo web si no estamos en Electron
                const response = await fetch('/api/bloqueo-auto/stream', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fixed: { tipoPersona, idPersona, idMotivo, observaciones },
                        bloques,
                    }),
                });

                if (!response.ok || !response.body) {
                    throw new Error(`Error del servidor: ${response.status}`)
                }

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop()

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue
                        try {
                            const event = JSON.parse(line.slice(6))
                            if (event.type === 'progress') {
                                setProgreso({ index: event.index, total: event.total, exitosos: event.exitosos, erroresCount: event.erroresCount })
                            } else if (event.type === 'block_error') {
                                setErroresList(prev => [...prev, { bloque: event.bloque, motivo: event.motivo }])
                            } else if (event.type === 'done') {
                                setEstado('ok')
                                setMensajeFinal(`✅ Proceso terminado. ${event.exitosos} exitosos` + (event.errores.length > 0 ? `, ${event.errores.length} con error.` : ', sin errores.'))
                            } else if (event.type === 'fatal') {
                                setEstado('error')
                                setMensajeFinal(`❌ Error fatal: ${event.message}`)
                            }
                        } catch { }
                    }
                }
            }
        } catch (err) {
            setEstado('error')
            setMensajeFinal(`❌ Error al conectar: ${err.message}`)
        } finally {
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners('bloqueo-masivo-progress');
            }
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────
    const pct = progreso.total > 0 ? Math.round((progreso.index / progreso.total) * 100) : 0

    return (
        <div style={s.card}>
            <h2 style={s.title}>🔒 Bloqueo Masivo</h2>

            {/* ── Config global ─────────────────────────────────────────── */}
            <div style={s.section}>
                <label style={s.label}>Tipo de persona</label>
                <select 
                    id="bm-tipo-persona" 
                    value={tipoPersona} 
                    onChange={e => {
                        setTipoPersona(e.target.value)
                        setIdPersona('')
                        setIdMotivo('')
                    }} 
                    style={s.select}
                >
                    {TIPOS_PERSONA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            <div style={s.section}>
                <label style={s.label}>Persona</label>
                <select id="bm-persona" value={idPersona} onChange={e => setIdPersona(e.target.value)} style={s.select}>
                    <option value="">— Seleccioná una persona —</option>
                    {getPersonas().map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            <div style={s.section}>
                <label style={s.label}>Motivo de bloqueo</label>
                <select id="bm-motivo" value={idMotivo} onChange={e => setIdMotivo(e.target.value)} style={s.select}>
                    <option value="">— Seleccioná un motivo —</option>
                    {getMotivos().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            <div style={s.section}>
                <label style={s.label}>Observaciones</label>
                <input
                    id="bm-observaciones"
                    type="text"
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                    placeholder="Ej: Posgrado Parra"
                    style={s.input}
                />
            </div>

            {/* ── Agregar bloque ────────────────────────────────────────── */}
            <div style={s.section}>
                <label style={s.label}>
                    Bloques horarios
                    <span style={s.hint}> (DD/MM/AAAA | HH:MM - HH:MM)</span>
                </label>
                <div style={s.addRow}>
                    <input
                        id="bm-nuevo-bloque"
                        type="text"
                        value={nuevo}
                        onChange={e => { setNuevo(e.target.value); setNuevoError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleAgregar()}
                        placeholder="09/03/2026 | 15:00 - 18:00"
                        style={{ ...s.input, flex: 1 }}
                    />
                    <button id="bm-agregar-btn" onClick={handleAgregar} style={s.btnAdd}>
                        + Agregar
                    </button>
                </div>
                {nuevoError && <span style={s.errorTxt}>{nuevoError}</span>}
            </div>

            {/* ── Lista de bloques ──────────────────────────────────────── */}
            {bloques.length > 0 && (
                <div style={s.listaWrap}>
                    <div style={s.listaHeader}>
                        <span style={s.listaCount}>{bloques.length} bloque{bloques.length !== 1 ? 's' : ''}</span>
                        <button id="bm-limpiar-btn" onClick={() => setBloques([])} style={s.btnClear}>
                            Limpiar todo
                        </button>
                    </div>
                    <ul style={s.lista}>
                        {bloques.map((b, idx) => (
                            <li key={idx} style={s.listaItem}>
                                {editIdx === idx ? (
                                    <div style={{ flex: 1 }}>
                                        <div style={s.addRow}>
                                            <input
                                                type="text"
                                                value={editVal}
                                                onChange={e => { setEditVal(e.target.value); setEditError('') }}
                                                onKeyDown={e => e.key === 'Enter' && handleGuardarEdit(idx)}
                                                style={{ ...s.input, flex: 1, fontSize: '13px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => handleGuardarEdit(idx)} style={s.btnSave}>✓</button>
                                            <button onClick={() => { setEditIdx(null); setEditVal(''); setEditError('') }} style={s.btnCancel}>✕</button>
                                        </div>
                                        {editError && <span style={s.errorTxt}>{editError}</span>}
                                    </div>
                                ) : (
                                    <>
                                        <span style={s.bloqueTexto}>{b}</span>
                                        <div style={s.itemActions}>
                                            <button onClick={() => { setEditIdx(idx); setEditVal(b); setEditError('') }} style={s.btnEdit} title="Editar">✏️</button>
                                            <button onClick={() => handleEliminar(idx)} style={s.btnDelete} title="Eliminar">🗑️</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Botón lanzar ─────────────────────────────────────────── */}
            <button
                id="bm-lanzar-btn"
                onClick={handleLanzar}
                disabled={estado === 'loading'}
                style={{ ...s.btnLanzar, ...(estado === 'loading' ? s.btnLanzarDisabled : {}) }}
            >
                {estado === 'loading'
                    ? `⏳ Procesando ${progreso.index}/${progreso.total}...`
                    : `🚀 Lanzar bloqueo masivo (${bloques.length} bloques)`}
            </button>

            {/* ── Barra de progreso ─────────────────────────────────────── */}
            {estado === 'loading' && (
                <div style={s.progressWrap}>
                    <div style={{ ...s.progressBar, width: `${pct}%` }} />
                    <div style={s.progressStats}>
                        <span style={{ color: '#86efac' }}>✓ {progreso.exitosos} ok</span>
                        {progreso.erroresCount > 0 && (
                            <span style={{ color: '#fca5a5' }}>✗ {progreso.erroresCount} error{progreso.erroresCount !== 1 ? 'es' : ''}</span>
                        )}
                        <span style={{ color: '#9D9D9D' }}>{pct}%</span>
                    </div>
                </div>
            )}

            {/* ── Mensaje final ─────────────────────────────────────────── */}
            {mensajeFinal && (
                <div style={{
                    ...s.mensajeBox,
                    background: estado === 'ok'
                        ? (erroresList.length > 0 ? '#1a1500' : '#0d2e1a')
                        : '#2e0d0d',
                    borderColor: estado === 'ok'
                        ? (erroresList.length > 0 ? '#ca8a04' : '#22c55e')
                        : '#ef4444',
                    color: estado === 'ok'
                        ? (erroresList.length > 0 ? '#fde68a' : '#86efac')
                        : '#fca5a5',
                }}>
                    {mensajeFinal}
                </div>
            )}

            {/* ── Lista de errores ──────────────────────────────────────── */}
            {erroresList.length > 0 && (
                <div style={s.erroresWrap}>
                    <div style={s.erroresHeader}>
                        <span style={{ color: '#fca5a5', fontWeight: 700 }}>
                            ⚠️ {erroresList.length} bloque{erroresList.length !== 1 ? 's' : ''} con error
                        </span>
                    </div>
                    <ul style={s.erroresList}>
                        {erroresList.map((e, i) => (
                            <li key={i} style={s.errorItem}>
                                <div style={s.errorBloque}>📅 {e.bloque}</div>
                                <div style={s.errorMotivo}>{e.motivo}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = {
    card: {
        width: '100%',
        border: '1px solid #2B2B2B',
        borderRadius: '8px',
        padding: '20px 24px',
        background: '#111111',
        color: '#CCCCCC',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    title: {
        color: '#FFFFFF',
        fontSize: '22px',
        fontWeight: 600,
        marginBottom: '20px',
        marginTop: 0,
    },
    section: {
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#9D9D9D',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    hint: {
        fontWeight: 400,
        textTransform: 'none',
        color: '#555',
        fontSize: '12px',
    },
    select: {
        background: '#1c1c1c',
        color: '#FFFFFF',
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        height: '36px',
        padding: '0 10px',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
    },
    input: {
        background: '#1c1c1c',
        color: '#FFFFFF',
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        height: '36px',
        padding: '0 10px',
        fontSize: '14px',
        outline: 'none',
    },
    addRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
    },
    btnAdd: {
        background: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '0 16px',
        height: '36px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        whiteSpace: 'nowrap',
    },
    errorTxt: {
        color: '#f87171',
        fontSize: '12px',
    },
    listaWrap: {
        border: '1px solid #2B2B2B',
        borderRadius: '6px',
        marginBottom: '16px',
        overflow: 'hidden',
    },
    listaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: '#1a1a1a',
        borderBottom: '1px solid #2B2B2B',
    },
    listaCount: {
        fontSize: '13px',
        color: '#9D9D9D',
        fontWeight: 600,
    },
    btnClear: {
        background: 'transparent',
        color: '#f87171',
        border: '1px solid #7f1d1d',
        borderRadius: '4px',
        padding: '2px 10px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    lista: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: '240px',
        overflowY: 'auto',
    },
    listaItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        borderBottom: '1px solid #1e1e1e',
        gap: '8px',
    },
    bloqueTexto: {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e2e8f0',
        flex: 1,
    },
    itemActions: { display: 'flex', gap: '4px' },
    btnEdit: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 4px',
        borderRadius: '4px',
    },
    btnDelete: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '2px 4px',
        borderRadius: '4px',
    },
    btnSave: {
        background: '#166534',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px',
    },
    btnCancel: {
        background: '#7f1d1d',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '14px',
    },
    btnLanzar: {
        width: '100%',
        height: '44px',
        background: '#7c3aed',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.02em',
    },
    btnLanzarDisabled: {
        background: '#3b1f6e',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    progressWrap: {
        marginTop: '10px',
        background: '#1c1c1c',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #2B2B2B',
    },
    progressBar: {
        height: '6px',
        background: 'linear-gradient(90deg, #7c3aed, #22c55e)',
        transition: 'width 0.4s ease',
    },
    progressStats: {
        display: 'flex',
        gap: '16px',
        padding: '6px 12px',
        fontSize: '13px',
    },
    mensajeBox: {
        marginTop: '12px',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'monospace',
        border: '1px solid',
    },
    erroresWrap: {
        marginTop: '12px',
        border: '1px solid #7f1d1d',
        borderRadius: '6px',
        overflow: 'hidden',
        background: '#150505',
    },
    erroresHeader: {
        padding: '8px 12px',
        background: '#1a0000',
        borderBottom: '1px solid #7f1d1d',
        fontSize: '13px',
    },
    erroresList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: '240px',
        overflowY: 'auto',
    },
    errorItem: {
        padding: '8px 12px',
        borderBottom: '1px solid #2a0000',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    errorBloque: {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#fcd34d',
        fontWeight: 600,
    },
    errorMotivo: {
        fontSize: '12px',
        color: '#fca5a5',
        fontStyle: 'italic',
    },
}
