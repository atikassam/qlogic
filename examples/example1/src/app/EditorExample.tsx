import {
  QLogicBuilder,
  QLogicBuilderProvider,
  QLogicEnvironment,
} from '@qlogic/react';
import '@qlogic/react/index.esm.css';
import { useMemo } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { QLogicCodePreview } from './QLogicCodePreview';

export function EditorExample() {
  const env = useMemo(
    () =>
      QLogicEnvironment.create<{ title: string }>({
        namespace: QLogicEnvironment.toNamespace('qlogic_a7'),
        lazyData: [
          {
            id: 'Questions',
            key: 'Questions',
            label: 'Questions',
            name: 'Questions',
            next: [
              {
                id: 'q2',
                key: 'q2',
                label: 'Q2',
                isList: true,
                next: [
                  {
                    id: 'q2:2',
                    key: 'q2:2',
                    label: 'Q2:2',
                    isList: true,
                    next: [
                      {
                        id: 'q2:2:1',
                        key: 'q2:2:1',
                        label: 'Q2:2:1',
                      },
                      {
                        id: 'q2:2:2',
                        key: 'q2:2:2',
                        label: 'Q2:2:2',
                      },
                    ],
                  },
                ],
              },
              {
                id: 'q1',
                key: 'q1',
                label: 'Q1',
                isList: true,
                next: [
                  {
                    id: 'q1:1',
                    key: 'q1:1',
                    label: 'Q1:1',
                    next: [
                      {
                        id: 'q1:1:1',
                        key: 'q1:1:1',
                        label: 'Q1:1:1',
                      },
                    ],
                  },
                ],
              },
            ],
            func: (ctx, path) => {
              console.log('Lazy data', path);
              return 'ok';
            },
          },
        ],
        qfuns: [
          {
            conditional: true,
            name: 'CreateCharge',
            allowedPrevious: [{ qfunc: 'CreateCharge' }],
            allowedNext: [{ qfunc: 'CreateCharge' }],
            returns: [
              { name: 'Charge', type: 'Number', label: 'Charge' },
              { name: 'Label', type: 'String', label: 'Label' },
              {
                name: 'Type',
                type: 'options',
                label: 'Type',
                options: [
                  { label: 'Premium', value: 'premium' },
                  {
                    label: 'Tax',
                    value: 'tax',
                    // type: 'options',
                    // options: [
                    //   { label: 'GST', value: 'gst' },
                    //   { label: 'VAT', value: 'vat' },
                    //   { label: 'Sales Tax', value: 'sales_tax' },
                    // ],
                  },
                  { label: 'Fee', value: 'fee' },
                  { label: 'Other', value: 'other' },
                ],
              },
            ],
            func: (ctx, returns) => console.log(returns),
          },
        ],
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
              {
                name: 'Type',
                type: 'options',
                label: 'Type',
                options: [
                  { label: 'Premium', value: 'premium' },
                  { label: 'Tax', value: 'tax' },
                  { label: 'Fee', value: 'fee' },
                  { label: 'Other', value: 'other' },
                ],
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
            func: (opt, msg: string) => {
              console.log('Alert', msg);
              alert(msg);
            },
          },
        ],
      }),
    []
  );

  const ctx = useMemo(() => {
    return {
      data: {
        a: 1,
        b: 2,
      },
    };
  }, []);

  return (
    <QLogicBuilderProvider environment={env}>
      {(helper) => (
        <Card variant={'outlined'} sx={{ p: 2, m: 2 }}>
          <Grid container direction={'row'} spacing={2}>
            <Grid item md={12} container direction={'row'}>
              <Typography variant={'h5'}>QLogic Builder</Typography>
              <Box flex={1} />
              <ButtonGroup
                size={'small'}
                variant={'contained'}
                disableElevation
              >
                <Button onClick={() => console.log(helper.state)}>Log</Button>
                <Button
                  onClick={() =>
                    env.execute(helper.state, { ...ctx, data: { title: 'ok' } })
                  }
                >
                  Run
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item md={12}>
              <Divider />
            </Grid>
            <Grid item md={8} sm={12} xs={12}>
              <QLogicBuilder />
            </Grid>
            <Grid item md={3}>
              <QLogicCodePreview />
            </Grid>
          </Grid>
        </Card>
      )}
    </QLogicBuilderProvider>
  );
}
