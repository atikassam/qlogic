import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { QLogicEnvironment } from '@qlogic/nodejs/node';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  getData(): { message: string } {
    // common();
    return { message: 'Hello API' };
  }

  async onApplicationBootstrap() {
    const env = QLogicEnvironment.create({
      functions: [
        {
          name: 'add',
          args: [
            {
              name: 'a',
              type: 'number',
            },
            {
              name: 'b',
              type: 'number',
            },
          ],
          returnType: 'number',
          func: (option, a: number, b: number) => a + b,
        },
        {
          name: 'alert',
          args: [
            {
              name: 'msg',
              type: 'any',
            },
          ],
          func: (opt, msg: string) => console.log(msg),
        },
      ],
    });

    console.log(
      await env.execute(
        {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: 'variables_set',
                id: 'Bm,|qG;92=QU:Rr4z|g]',
                x: 28,
                y: 31,
                fields: {
                  VAR: {
                    id: 'Count',
                  },
                },
                inputs: {
                  VALUE: {
                    block: {
                      type: 'math_number',
                      id: '0AcHTvQrz$T}setIV6CU',
                      fields: {
                        NUM: 1,
                      },
                    },
                  },
                },
                next: {
                  block: {
                    type: 'controls_whileUntil',
                    id: '/QuV(m2.HdW(3r/*FdNg',
                    fields: {
                      MODE: 'WHILE',
                    },
                    inputs: {
                      BOOL: {
                        block: {
                          type: 'logic_compare',
                          id: '?vC|~Ml)%MFEvi]gU,3J',
                          fields: {
                            OP: 'LTE',
                          },
                          inputs: {
                            A: {
                              block: {
                                type: 'variables_get',
                                id: 'Jap4$Iy38CR)Nkw#A;#G',
                                fields: {
                                  VAR: {
                                    id: 'Count',
                                  },
                                },
                              },
                            },
                            B: {
                              block: {
                                type: 'math_number',
                                id: 'z*{CO{WzL6_if8CUD_2i',
                                fields: {
                                  NUM: 3,
                                },
                              },
                            },
                          },
                        },
                      },
                      DO: {
                        block: {
                          type: 'variables_set',
                          id: ';(^pB=Ha3Z/ur1u|i{@+',
                          fields: {
                            VAR: {
                              id: 'Count',
                            },
                          },
                          inputs: {
                            VALUE: {
                              block: {
                                type: 'math_arithmetic',
                                id: '4a.DAMhREjr5oUyvO7h%',
                                fields: {
                                  OP: 'ADD',
                                },
                                inputs: {
                                  A: {
                                    block: {
                                      type: 'variables_get',
                                      id: ';|#PX`9`~~u]JRwn05!`',
                                      fields: {
                                        VAR: {
                                          id: 'Count',
                                        },
                                      },
                                    },
                                  },
                                  B: {
                                    block: {
                                      type: 'math_number',
                                      id: 'N_o@Ga,S[|:dEW#[Y~!8',
                                      fields: {
                                        NUM: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          next: {
                            block: {
                              type: 'custom_function_alert',
                              id: 'C,heA5tJ8ZJ=dwD-enI9',
                              inputs: {
                                msg: {
                                  block: {
                                    type: 'variables_get',
                                    id: '(xGJ/pk(~-OxiI(}+/n_',
                                    fields: {
                                      VAR: {
                                        id: 'Count',
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
          variables: [
            {
              name: 'Count',
              id: 'Count',
            },
          ],
        },
        { data: { a: 1, b: 2 } }
      )
    );
  }
}
